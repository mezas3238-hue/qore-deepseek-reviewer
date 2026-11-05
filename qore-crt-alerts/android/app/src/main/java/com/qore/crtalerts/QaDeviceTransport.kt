package com.qore.crtalerts

import android.app.Activity
import android.content.Context
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.appcheck.FirebaseAppCheck
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.messaging.FirebaseMessaging
import okhttp3.Call
import okhttp3.Callback
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import org.json.JSONObject
import java.io.IOException

// User-tapped QA enrollment only. No market push, token logging or trades.
internal object QaDeviceTransport {
    private val http = OkHttpClient()
    private fun identityReady() = BuildConfig.QA_FIREBASE_IDENTIFICATION_ENABLED &&
        BuildConfig.QA_FIREBASE_APP_ID.isNotBlank() &&
        BuildConfig.QA_FIREBASE_API_KEY.isNotBlank()
    private fun ready() = BuildConfig.QA_TEST_TRANSPORT_ENABLED &&
        BuildConfig.QA_BRIDGE_URL.startsWith("https://") &&
        BuildConfig.QA_FIREBASE_APP_ID.isNotBlank() &&
        BuildConfig.QA_FIREBASE_API_KEY.isNotBlank()
    private fun app(context: Context): FirebaseApp {
        val existing = FirebaseApp.getApps(context).firstOrNull {
            it.name == FirebaseApp.DEFAULT_APP_NAME
        }
        if (existing != null) {
            QaAppCheckFactory.install(existing)
            return existing
        }
        val opts = FirebaseOptions.Builder()
            .setApplicationId(BuildConfig.QA_FIREBASE_APP_ID)
            .setApiKey(BuildConfig.QA_FIREBASE_API_KEY)
            .setProjectId(BuildConfig.QA_FIREBASE_PROJECT_ID)
            .setGcmSenderId(BuildConfig.QA_FIREBASE_SENDER_ID)
            .build()
        val instance = FirebaseApp.initializeApp(context.applicationContext, opts)
            ?: throw IllegalStateException("QA_FIREBASE_NOT_INITIALIZED")
        QaAppCheckFactory.install(instance)
        return instance
    }
    private fun authenticated(activity: Activity,
                              ok: (String, String, String) -> Unit,
                              fail: (String) -> Unit) {
        if (!ready()) return fail("Falta configurar Firebase y HTTPS en la APK QA.")
        val firebase = try { app(activity) } catch (_: Exception) {
            return fail("No se pudo inicializar Firebase QA.")
        }
        val auth = FirebaseAuth.getInstance(firebase)
        fun continueAuth() {
            val user = auth.currentUser ?: return fail("No hay usuario Firebase.")
            user.getIdToken(false).addOnSuccessListener { identity ->
                val jwt = identity.token ?: return@addOnSuccessListener fail(
                    "Firebase no entregó identidad.")
                FirebaseAppCheck.getInstance(firebase).getAppCheckToken(false)
                    .addOnSuccessListener { check ->
                        if (check.token.isBlank())
                            fail("App Check no emitió comprobante.")
                        else ok(user.uid, jwt, check.token)
                    }.addOnFailureListener {
                        fail("App Check pendiente; registra dispositivo QA. UID: " + user.uid)
                    }
            }.addOnFailureListener { fail("No se obtuvo identidad Firebase.") }
        }
        if (auth.currentUser == null)
            auth.signInAnonymously().addOnSuccessListener {
                continueAuth()
            }.addOnFailureListener {
                fail("Habilita inicio anónimo en Firebase Auth QA.")
            }
        else continueAuth()
    }
    private fun request(activity: Activity, path: String, method: String,
                        jwt: String, check: String, json: JSONObject?,
                        done: (Int, JSONObject?) -> Unit) {
        val url = BuildConfig.QA_BRIDGE_URL + path
        if (!ready() || !url.startsWith("https://"))
            return activity.runOnUiThread { done(0, null) }
        val builder = Request.Builder().url(url)
            .header("Authorization", "Bearer $jwt")
            .header("X-Firebase-AppCheck", check)
            .header("Cache-Control", "no-store")
        val request = if (method == "GET") builder.get().build()
            else builder.post((json ?: JSONObject()).toString()
                .toRequestBody("application/json; charset=utf-8".toMediaType())).build()
        http.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                activity.runOnUiThread { done(0, null) }
            }
            override fun onResponse(call: Call, response: Response) {
                response.use {
                    val body = try { JSONObject(it.body?.string() ?: "") }
                               catch (_: Exception) { null }
                    activity.runOnUiThread { done(it.code, body) }
                }
            }
        })
    }
    fun identifyForOwner(activity: Activity, notice: (String) -> Unit) {
        if (!identityReady()) return notice(
            "Primero configura los identificadores públicos de Firebase QA en GitHub Secrets.")
        val firebase = try { app(activity) } catch (_: Exception) {
            return notice("No se pudo iniciar Firebase QA.")
        }
        val auth = FirebaseAuth.getInstance(firebase)
        val old = auth.currentUser
        if (old != null) {
            notice("UID de este teléfono: " + old.uid +
                ". Registra esta UID únicamente en Railway STAGING.")
        } else {
            auth.signInAnonymously().addOnSuccessListener { login ->
                notice("UID de este teléfono: " + login.user?.uid +
                    ". Regístrala en Railway STAGING. Nunca envíes tokens.")
            }.addOnFailureListener {
                notice("Habilita Firebase Auth anónimo para iniciar identidad QA.")
            }
        }
    }
    fun enroll(activity: Activity, notice: (String) -> Unit) {
        authenticated(activity, { uid, jwt, check ->
            notice("Firebase inició sesión. UID: $uid. Validando propietario…")
            FirebaseMessaging.getInstance().token
                .addOnSuccessListener { token ->
                    if (token.isNullOrBlank()) return@addOnSuccessListener notice(
                        "FCM todavía no generó token.")
                    request(activity,"/qa/v1/device/enroll","POST",jwt,check,
                        JSONObject().put("deviceToken",token)) { code, json ->
                        if (code == 200 &&
                            json?.optString("state") == "ENROLLED_QA_TEST_ONLY") {
                            val prefs = activity.getSharedPreferences(
                                QaConsentGate.PREFS, Context.MODE_PRIVATE)
                            if (prefs.edit()
                                    .putBoolean(QaSystemTestPolicy.ENROLLED_KEY,true)
                                    .putBoolean(QaSystemTestPolicy.ENABLED_KEY,true)
                                    .commit())
                                notice("Teléfono vinculado para pruebas; NO señales CRT.")
                            else notice("No se pudo guardar consentimiento local.")
                        } else notice("Railway rechazó vinculación ($code). UID: $uid. " +
                            "Autoriza esta UID en Railway.")
                    }
                }.addOnFailureListener { notice("FCM no pudo entregar token.") }
        },notice)
    }
    fun ping(activity: Activity, notice: (String) -> Unit) {
        val p = activity.getSharedPreferences(QaConsentGate.PREFS, Context.MODE_PRIVATE)
        if (!p.getBoolean(QaSystemTestPolicy.ENROLLED_KEY,false) ||
            !p.getBoolean(QaSystemTestPolicy.ENABLED_KEY,false))
            return notice("Primero debes vincular el teléfono.")
        authenticated(activity, { _, jwt, check ->
            request(activity,"/qa/v1/system/test-ping","POST",jwt,check,JSONObject()) {
                code,json -> notice(if (code==202)
                    "FCM aceptó el test, falta confirmar recepción en Android."
                    else "Test bloqueado ($code): " + (json?.optString("state") ?: "sin respuesta"))
            }
        },notice)
    }
    fun fetchQaInbox(activity: Activity, notice: (String) -> Unit,
                     finish: (List<Map<String,String>>) -> Unit) {
        authenticated(activity, { _, jwt, check ->
            request(activity,"/qa/v1/alerts","GET",jwt,check,null) { code,json ->
                if (code!=200 || json==null) notice("Buzón QA no accesible ($code).")
                else {
                    val array=json.optJSONArray("alerts")
                    if (array==null || array.length()>1024) notice("Buzón QA inválido.")
                    else {
                        val rows=mutableListOf<Map<String,String>>()
                        for (i in 0 until array.length()) {
                            val item=array.optJSONObject(i) ?: continue
                            val record=mutableMapOf<String,String>()
                            val keys=item.keys()
                            while(keys.hasNext()) {
                                val key=keys.next()
                                val value=item.opt(key)
                                if (value!=null && value!=JSONObject.NULL &&
                                    (value is String || value is Number || value is Boolean))
                                    record[key]=value.toString()
                            }
                            rows.add(record)
                        }
                        finish(rows)
                        notice("Buzón QA recibido: " + rows.size + " registros, sin certificar.")
                    }
                }
            }
        },notice)
    }
    fun unregister(activity: Activity, notice: (String) -> Unit) {
        val p=activity.getSharedPreferences(QaConsentGate.PREFS,Context.MODE_PRIVATE)
        p.edit().putBoolean(QaSystemTestPolicy.ENROLLED_KEY,false)
            .putBoolean(QaSystemTestPolicy.ENABLED_KEY,false).commit()
        authenticated(activity, { _, jwt, check ->
            request(activity,"/qa/v1/device/unregister","POST",jwt,check,JSONObject()) {
                code, _ ->
                if (code==200) {
                    FirebaseMessaging.getInstance().deleteToken()
                    notice("Teléfono desvinculado de pruebas.")
                } else notice("Pruebas locales detenidas; revocación remota pendiente.")
            }
        },notice)
    }
}
