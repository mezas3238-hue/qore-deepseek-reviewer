import {createHmac} from "node:crypto";

// QA only. No external API, credential storage, Firebase connection or sender.
// A production adapter MUST authenticate a principal server-side; client
// supplied flags or user IDs cannot grant any registration authority.
const TTL=30*24*60*60*1000;
const valid=x=>typeof x==="string"&&/^[A-Za-z0-9_.:-]{12,256}$/.test(x);
const time=x=>Number.isSafeInteger(x)&&x>0;
const reply=(state,more={})=>Object.freeze({
  state,environment:"OFFLINE_REPLAY",actionable:false,sendPush:false,...more});

export class QaDeviceRegistry {
  #verify;#secret;#project;#rows=new Map();
  constructor({verifyAuth,hashSecret,projectId,applicationId="com.qore.crtalerts.qa"}={}){
    if(typeof verifyAuth!=="function")throw Error("server verifier required");
    if(typeof hashSecret!=="string"||hashSecret.length<32)
      throw Error("strong HMAC secret required");
    if(!valid(projectId)||applicationId!=="com.qore.crtalerts.qa")
      throw Error("QA project and app identifier required");
    this.#verify=verifyAuth;this.#secret=hashSecret;this.#project=projectId;
  }
  #hash(user,slot){
    return createHmac("sha256",this.#secret)
      .update(JSON.stringify([this.#project,user,slot])).digest("hex");
  }
  async #user(credential){
    if(typeof credential!=="string"||!credential)return null;
    try{
      const p=await this.#verify(credential);
      return p?.verified===true&&valid(p.subject)?p.subject:null;
    }catch{return null;}
  }
  async register({credential,projectId,deviceSlot,installationId,
    observedAt,optedIn=false}={}){
    const user=await this.#user(credential);
    if(!user)return reply("AUTHENTICATION_REQUIRED");
    if(projectId!==this.#project||!valid(deviceSlot)||!valid(installationId))
      return reply("INVALID_PROJECT_OR_INSTALLATION");
    if(!time(observedAt))return reply("INVALID_OBSERVED_TIME");
    if(optedIn!==true)return reply("EXPLICIT_OPT_IN_REQUIRED");
    const handle=this.#hash(user,deviceSlot);
    const registrationHash=this.#hash(user,installationId);
    const previous=this.#rows.get(handle);
    if(previous&&observedAt<previous.lastSeenAt)
      return reply("STALE_ROTATION_IGNORED",{handle});
    const rotated=!!previous&&previous.registrationHash!==registrationHash;
    this.#rows.set(handle,Object.freeze({
      userKey:this.#hash(user,"scope"),handle,registrationHash,
      lastSeenAt:observedAt,expiresAt:observedAt+TTL,
      deliveryState:"BLOCKED_NOT_CERTIFIED"
    }));
    return reply(rotated?"QA_INSTALLATION_ROTATED":
      previous?"QA_REGISTRATION_REFRESHED":"QA_REGISTERED",
      {handle,expiresAt:observedAt+TTL});
  }
  async revoke({credential,deviceSlot}={}){
    const user=await this.#user(credential);
    if(!user)return reply("AUTHENTICATION_REQUIRED");
    if(!valid(deviceSlot))return reply("INVALID_DEVICE_SLOT");
    const handle=this.#hash(user,deviceSlot);
    return reply(this.#rows.delete(handle)?"QA_REVOKED":"QA_NOT_FOUND",{handle});
  }
  async list({credential,now}={}){
    const user=await this.#user(credential);
    if(!user)return reply("AUTHENTICATION_REQUIRED");
    if(!time(now))return reply("INVALID_OBSERVED_TIME");
    const userKey=this.#hash(user,"scope");
    const registrations=[...this.#rows.values()]
      .filter(x=>x.userKey===userKey&&x.expiresAt>now)
      .map(x=>Object.freeze({
        handle:x.handle,lastSeenAt:x.lastSeenAt,
        expiresAt:x.expiresAt,deliveryState:x.deliveryState}));
    return reply("QA_REGISTRATIONS",{
      registrations:Object.freeze(registrations),count:registrations.length});
  }
  pruneExpired({now}={}){
    if(!time(now))throw Error("valid UTC epoch timestamp required");
    let purged=0;
    for(const [key,row] of this.#rows)
      if(row.expiresAt<=now){this.#rows.delete(key);purged++;}
    return reply("STALE_QA_REGISTRATIONS_PURGED",{purged});
  }
  get size(){return this.#rows.size;}
}
