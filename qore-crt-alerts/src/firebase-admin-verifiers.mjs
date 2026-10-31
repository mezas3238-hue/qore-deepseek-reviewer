// Adapter for Firebase Admin SDK objects, not a Firebase initialization.
// Requires explicitly injected Admin Auth and App Check services configured
// for ONE verified Firebase QA project. Never accepts a raw decoded token.
export function makeFirebaseAdminVerifiers({
  auth,appCheck,projectId,firebaseAppId
}={}){
  if(typeof auth?.verifyIdToken!=="function"||
     typeof appCheck?.verifyToken!=="function"||
     typeof projectId!=="string"||projectId.length<12||
     typeof firebaseAppId!=="string"||firebaseAppId.length<12)
    throw Error("verified Firebase Admin Auth/App Check and IDs required");
  return Object.freeze({
    async verifyAuth(idToken){
      if(typeof idToken!=="string"||!idToken)return null;
      try{
        const token=await auth.verifyIdToken(idToken,true);
        if(token?.aud!==projectId||typeof token.uid!=="string"||
           token.uid.length<12)return null;
        return Object.freeze({verified:true,subject:token.uid});
      }catch{return null;}
    },
    async verifyAppCheck(appCheckToken){
      if(typeof appCheckToken!=="string"||!appCheckToken)return null;
      try{
        // consume:true prevents replay for sensitive registration calls.
        // The client must obtain limited-use App Check tokens.
        const verified=await appCheck.verifyToken(appCheckToken,{consume:true});
        if(verified?.alreadyConsumed===true||verified?.appId!==firebaseAppId)
          return null;
        return Object.freeze({verified:true,projectId,appId:firebaseAppId,
          alreadyConsumed:false});
      }catch{return null;}
    }
  });
}
