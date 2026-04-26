package com.principal

import android.app.Activity
import android.content.Intent
import android.provider.Settings
import android.util.Log
import android.widget.Toast
import androidx.activity.result.*
import com.facebook.react.bridge.*


class CameraModule(reactContext: ReactApplicationContext?)  :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener{

    init {
        reactContext?.addActivityEventListener(this)
    }

    private val LAUNCH_SECOND_ACTIVITY = 1
    private var promise_aux: Promise? = null
    private var angle: String? = null
    private var velocity: String? = null
    private var serie: String? = null
    private var counter: String? = null
    private var SwitchSerie2: String? = null


    @ReactMethod
    fun openCamera(counter: Int, serie: Int, anguloVideo: Int, promise: Promise) {
        try {
            //return angle

            val intent = Intent(currentActivity, DoubleCamera3::class.java)
            Log.i("DINHO","Va a empezar la actividad!, con angulo: "+ angle + " contador: "
            + counter + " y serie: " + serie)
            intent.putExtra("contador", counter)
            intent.putExtra("serie", serie)
            intent.putExtra("anguloVideo", anguloVideo)
            currentActivity!!.startActivityForResult(intent, LAUNCH_SECOND_ACTIVITY)
            Log.i("DINHO","Retornamos camara con angulo: " + angle)
            promise_aux = promise

        } catch (e: Exception) {
            Toast.makeText(reactApplicationContext, "ERROR", Toast.LENGTH_SHORT).show()
            promise.reject(e.message, e.message)
        }

    }

    override fun getName() = "DiegoCamera"

    override fun getConstants(): Map<String, Any>? {
        val constants: MutableMap<String, Any> = HashMap()
        val android_id = Settings.System.getString(
            reactApplicationContext.contentResolver, Settings.Secure.ANDROID_ID
        )
        constants["uniqueId"] = android_id
        return constants
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {

        if (requestCode === LAUNCH_SECOND_ACTIVITY) {
            if (resultCode === Activity.RESULT_OK) {
                Log.i("DINHO","Justo antes de saber el valor de angle: " + angle)
                angle = data?.getStringExtra("angle")
                Log.i("DINHO","Listo! Angulo: " + angle)
                velocity = data?.getStringExtra("velocity")
                Log.i("DINHO","Listo! velocidad: " + velocity)
                serie = data?.getStringExtra("serie")
                Log.i("DINHO","Listo! Serie número: " + serie)
                counter = data?.getStringExtra("counter")
                Log.i("DINHO","Listo! Counter: " + counter)
                SwitchSerie2 = data?.getStringExtra("switch")
                Log.i("DINHO","Listo! Switch: " + SwitchSerie2)
                promise_aux?.resolve(angle + SwitchSerie2 + serie + "0" +counter)
                Log.i("DINHO","Listo! actualizado: " + angle)
            }
        }
    }

    override fun onNewIntent(p0: Intent?) { }

}