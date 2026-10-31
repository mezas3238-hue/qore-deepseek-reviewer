import {createHmac} from "node:crypto";

// Repository uses an injected pg-compatible db.query executor (e.g. a
// server-side PostgreSQL Pool) WITHOUT opening network connections itself.
// Never store raw FID, Firebase tokens, service-account JSON or user UIDs.
// Requires migrations 001/002/003 on an EXPLICITLY approved staging DB.
const valid=x=>typeof x==="string"&&/^[A-Za-z0-9_.:-]{12,256}$/.test(x);
const digest=(secret,parts)=>createHmac("sha256",secret)
  .update(JSON.stringify(parts)).digest("hex");
const reply=(state,more={})=>Object.freeze({state,environment:"OFFLINE_REPLAY",
 actionable:false,sendPush:false,deliveryState:"BLOCKED_NOT_CERTIFIED",...more});
const revision=x=>Number.isSafeInteger(x)&&x>=0;
// Only these explicitly whitelisted, non-sensitive PostgreSQL SQLSTATE
// 23514 conditions map to HTTP 409. All other DB failures are 503.
const conflictCodes=new Set([
 "QA_DEVICE_STALE_REVISION_OR_WRONG_OWNER",
 "QA_DEVICE_CONFLICT_OR_REVOKED",
 "QA_DEVICE_REVOCATION_CONFLICT"
]);
const failed=(error)=>{
 if(error?.code==="23514"&&conflictCodes.has(error?.message))
   return reply("QA_CONFLICT_HELD");
 return reply("QA_DATABASE_UNAVAILABLE");
};
export class PgQaDeviceRegistry{
 #db;#auth;#check;#secret;#project;#firebase;
 constructor({db,verifyAuth,verifyAppCheck,hashSecret,
   projectId,firebaseAppId}={}){
   if(typeof db?.query!=="function"||
      typeof verifyAuth!=="function"||typeof verifyAppCheck!=="function"||
      typeof hashSecret!=="string"||hashSecret.length<32||
      !valid(projectId)||!valid(firebaseAppId))
     throw Error("PostgreSQL, Firebase verifiers and QA IDs required");
   this.#db=db;this.#auth=verifyAuth;this.#check=verifyAppCheck;
   this.#secret=hashSecret;this.#project=projectId;this.#firebase=firebaseAppId;
 }
 #hash(...parts){return digest(this.#secret,[this.#project,...parts]);}
 async #user(credential){
   try{
     if(typeof credential!=="string"||!credential)return null;
     const x=await this.#auth(credential);
     return x?.verified===true&&valid(x.subject)?x.subject:null;
   }catch{return null;}
 }
 async register({credential,appCheckToken,projectId,deviceSlot,
   installationId,optedIn=false,expectedRevision=0}={}){
   const user=await this.#user(credential);
   if(!user)return reply("AUTHENTICATION_REQUIRED");
   if(typeof appCheckToken!=="string"||!appCheckToken)
     return reply("APP_CHECK_REQUIRED");
   let check=null;
   try{check=await this.#check(appCheckToken);}catch{}
   if(check?.verified!==true||check.projectId!==this.#project||
      check.appId!==this.#firebase||check.alreadyConsumed===true)
     return reply("APP_CHECK_INVALID");
   if(projectId!==this.#project||!valid(deviceSlot)||!valid(installationId)||
      !revision(expectedRevision)||expectedRevision>Number.MAX_SAFE_INTEGER-1)
     return reply("INVALID_PROJECT_OR_INSTALLATION");
   if(optedIn!==true)return reply("EXPLICIT_OPT_IN_REQUIRED");
   const handle=this.#hash(user,deviceSlot);
   try{
     const rows=await this.#db.query(
       "SELECT qore_crt_alerts.qa_stage_device($1,$2,$3,$4,$5,$6) AS result",
       [handle,this.#hash(user,"scope"),this.#hash(user,installationId),
        this.#project,expectedRevision,true]);
     const data=rows?.rows?.[0]?.result;
     if(!data||!revision(Number(data.revision)))return reply("QA_DATABASE_UNAVAILABLE");
     const states={
       QA_DEVICE_REGISTERED:"QA_REGISTERED",
       QA_DEVICE_DUPLICATE:"QA_REGISTRATION_REFRESHED",
       QA_DEVICE_ROTATED_OR_REFRESHED:"QA_INSTALLATION_ROTATED"
     };
     if(!states[data.state])return reply("QA_DATABASE_UNAVAILABLE");
     return reply(states[data.state],{handle,revision:Number(data.revision)});
   }catch(error){return failed(error);}
 }
 async revoke({credential,deviceSlot,expectedRevision}={}){
   const user=await this.#user(credential);
   if(!user)return reply("AUTHENTICATION_REQUIRED");
   if(!valid(deviceSlot)||!revision(expectedRevision)||expectedRevision<1)
     return reply("INVALID_DEVICE_SLOT");
   const handle=this.#hash(user,deviceSlot);
   try{
     const rows=await this.#db.query(
       "SELECT qore_crt_alerts.qa_revoke_device($1,$2,$3) AS result",
       [handle,this.#hash(user,"scope"),expectedRevision]);
     const data=rows?.rows?.[0]?.result;
     if(data?.state!=="QA_DEVICE_REVOKED"||!revision(Number(data.revision)))
       return reply("QA_DATABASE_UNAVAILABLE");
     return reply("QA_REVOKED",{handle,revision:Number(data.revision)});
   }catch(error){return failed(error);}
 }
 async list({credential}={}){
   const user=await this.#user(credential);
   if(!user)return reply("AUTHENTICATION_REQUIRED");
   try{
     const out=await this.#db.query(
       "SELECT handle,revision,(EXTRACT(EPOCH FROM expires_at)*1000)::BIGINT AS expires_ms "+
       "FROM qore_crt_alerts.qa_device_registrations "+
       "WHERE user_scope_hash=$1 AND active=TRUE AND "+
       "expires_at>transaction_timestamp() ORDER BY handle LIMIT 128",
       [this.#hash(user,"scope")]);
     const rows=out?.rows;
     if(!Array.isArray(rows)||rows.length>128)return reply("QA_DATABASE_UNAVAILABLE");
     const data=rows.map(x=>Object.freeze({
       handle:x.handle,revision:Number(x.revision),expiresAt:Number(x.expires_ms),
       deliveryState:"BLOCKED_NOT_CERTIFIED"}));
     if(data.some(x=>!(/^[a-f0-9]{64}$/.test(x.handle))||
       !revision(x.revision)||!Number.isSafeInteger(x.expiresAt)))
       return reply("QA_DATABASE_UNAVAILABLE");
     return reply("QA_REGISTRATIONS",{registrations:Object.freeze(data),count:data.length});
   }catch(error){return failed(error);}
 }
}
