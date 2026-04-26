package com.principal.newarchitecture

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Parcel
import android.os.Parcelable
import androidx.activity.result.contract.ActivityResultContract
import com.principal.DoubleCamera3

class CameraActivityContract : ActivityResultContract<Unit, Int?>(){

    //función que crea la conexión entre la clase 1 y la clase 2. Se le puede pasa un input poniendo
    //  .putExtra("input_name", input)
    override fun createIntent(context: Context, input: Unit): Intent {
        return Intent(context, DoubleCamera3::class.java)
    }

    //función que retorna valor de la clase 2
    override fun parseResult(resultCode: Int, intent: Intent?): Int? = when {
        resultCode != Activity.RESULT_OK -> null
        else -> intent?.getIntExtra("my_result_key", 0)
    }




}