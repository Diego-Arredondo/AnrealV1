package com.principal

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.BufferedInputStream
import java.io.DataInputStream
import java.io.EOFException
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.net.BindException
import java.net.Inet4Address
import java.net.NetworkInterface
import java.net.ServerSocket
import java.net.Socket

/**
 * Receives a video file pushed from the PC over a plain TCP socket on the local Wi-Fi network.
 *
 * The PHONE is the server: it opens a ServerSocket and waits; the PC connects and pushes the file.
 * Wire protocol: [8-byte big-endian unsigned size N][N bytes of mp4], then the PC closes.
 * The file is streamed (64 KB chunks) to app-private storage (filesDir), so no storage permission
 * is required, and is written to a ".part" file that is renamed atomically once complete.
 */
class TcpReceiverModule(reactContext: ReactApplicationContext?) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val DEFAULT_PORT = 8888
        private const val MAX_BYTES = 500L * 1024 * 1024 // 500 MB safety cap
        private const val CHUNK = 64 * 1024
        private const val OUT_NAME = "received_trajectory.mp4"
        private const val TAG = "TcpReceiver"
    }

    @Volatile private var serverSocket: ServerSocket? = null
    @Volatile private var clientSocket: Socket? = null
    @Volatile private var running = false
    @Volatile private var cancelled = false
    private var listenThread: Thread? = null

    override fun getName() = "TcpReceiver"

    override fun getConstants(): MutableMap<String, Any>? {
        val constants: MutableMap<String, Any> = HashMap()
        constants["port"] = DEFAULT_PORT
        return constants
    }

    private fun emit(event: String, params: WritableMap?) {
        try {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(event, params)
        } catch (e: Exception) {
            Log.w(TAG, "emit failed: " + e.message)
        }
    }

    /** First up, non-loopback, site-local IPv4 address (e.g. 192.168.x.y). */
    @ReactMethod
    fun getDeviceIp(promise: Promise) {
        try {
            val interfaces = NetworkInterface.getNetworkInterfaces()
            while (interfaces.hasMoreElements()) {
                val iface = interfaces.nextElement()
                if (!iface.isUp || iface.isLoopback || iface.isVirtual) continue
                val addresses = iface.inetAddresses
                while (addresses.hasMoreElements()) {
                    val addr = addresses.nextElement()
                    if (addr is Inet4Address && !addr.isLoopbackAddress && addr.isSiteLocalAddress) {
                        promise.resolve(addr.hostAddress)
                        return
                    }
                }
            }
            promise.reject("NO_IP", "No Wi-Fi/LAN IPv4 address found. Connect the phone to Wi-Fi.")
        } catch (e: Exception) {
            promise.reject("NO_IP", e.message, e)
        }
    }

    @ReactMethod
    fun startListening(port: Int, promise: Promise) {
        if (running) {
            promise.reject("ALREADY_LISTENING", "Already listening for a connection")
            return
        }
        running = true
        cancelled = false
        val usePort = if (port > 0) port else DEFAULT_PORT

        listenThread = Thread {
            var out: File? = null
            var part: File? = null
            try {
                val server = ServerSocket(usePort)
                serverSocket = server
                emit("waiting", Arguments.createMap().apply { putInt("port", usePort) })

                val client = server.accept()
                clientSocket = client
                emit("connected", Arguments.createMap().apply {
                    putString("peer", client.inetAddress?.hostAddress ?: "")
                })

                val input = DataInputStream(BufferedInputStream(client.getInputStream()))
                val total = input.readLong()
                if (total <= 0 || total > MAX_BYTES) {
                    throw IOException("Invalid file size header: $total")
                }

                val dir = reactApplicationContext.filesDir
                out = File(dir, OUT_NAME)
                part = File(dir, "$OUT_NAME.part")
                if (part.exists()) part.delete()

                val fos = FileOutputStream(part)
                val buffer = ByteArray(CHUNK)
                var readSoFar = 0L
                var lastEmit = 0L
                try {
                    while (readSoFar < total) {
                        val want = minOf(CHUNK.toLong(), total - readSoFar).toInt()
                        val n = input.read(buffer, 0, want)
                        if (n == -1) {
                            throw EOFException("Connection closed before full transfer ($readSoFar/$total)")
                        }
                        fos.write(buffer, 0, n)
                        readSoFar += n
                        if (readSoFar - lastEmit >= 256 * 1024 || readSoFar == total) {
                            lastEmit = readSoFar
                            emit("progress", Arguments.createMap().apply {
                                putInt("percent", (readSoFar * 100 / total).toInt())
                                putDouble("received", readSoFar.toDouble())
                                putDouble("total", total.toDouble())
                            })
                        }
                    }
                    fos.flush()
                    fos.fd.sync()
                } finally {
                    fos.close()
                }

                if (out.exists()) out.delete()
                if (!part.renameTo(out)) {
                    throw IOException("Could not finalize the received file")
                }

                val uri = "file://" + out.absolutePath
                emit("completed", Arguments.createMap().apply { putString("path", uri) })
                promise.resolve(uri)
            } catch (e: Exception) {
                try { part?.let { if (it.exists()) it.delete() } } catch (_: Exception) {}
                if (cancelled) {
                    promise.reject("CANCELLED", "Listening cancelled")
                } else {
                    Log.e(TAG, "receive failed", e)
                    emit("error", Arguments.createMap().apply { putString("message", e.message ?: "error") })
                    val code = if (e is BindException) "PORT_IN_USE" else "RECEIVE_FAILED"
                    promise.reject(code, e.message, e)
                }
            } finally {
                try { clientSocket?.close() } catch (_: Exception) {}
                try { serverSocket?.close() } catch (_: Exception) {}
                clientSocket = null
                serverSocket = null
                running = false
            }
        }
        listenThread!!.start()
    }

    @ReactMethod
    fun stopListening(promise: Promise) {
        cancelled = true
        running = false
        try { clientSocket?.close() } catch (_: Exception) {}
        try { serverSocket?.close() } catch (_: Exception) {}
        promise.resolve(null)
    }

    // No-op methods so React Native's NativeEventEmitter does not warn on Android.
    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}
}
