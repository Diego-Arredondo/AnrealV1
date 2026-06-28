# AnReal — Self-Serve build (full pipeline, video pushed from the PC)

This is the **`self-serve` branch**. Unlike `master` (which ships an APK with a fixed trajectory baked in), this build lets you run the **complete pipeline** and load *your own* trajectory video into the app **over Wi-Fi, with no rebuild per video**.

How it differs from `master`: the app opens on a **Receiver screen**, listens on a TCP socket, and the PC **pushes** the processed video to it. The phone is the server (it listens); the PC connects outbound — which also sidesteps Windows inbound-firewall issues.

---

## Requirements
- Same as `master` (Android 8+, arm64, rear camera + accelerometer + magnetometer) **plus**: the phone and PC must be on the **same Wi-Fi** (or have the PC join the phone's hotspot).
- PC with **Python 3.8+** for both the video processing (`opencv-python`, `numpy`) and the sender (`send_video.py`, standard library only).

---

## Full pipeline (the evaluator does all of this)

### 1. Record a trajectory video
Record the intended movement (e.g., a full forward lumbar bend) from the participant's viewpoint, and copy the file to the PC.

### 2. Process it
Edit the paths in the `__main__` block of `procesamiento_video.py`, then run it and mark the movement on the preview window:
- press **`c`** at the start of the forward movement,
- press **`q`** at its end.

It writes the processed clip to `src/media/videos/wena.mp4`.

### 3. Build / install the self-serve app (once)
```bash
cd android
gradlew.bat app:assembleRelease        # ./gradlew on macOS/Linux
adb install -r app/build/outputs/apk/release/app-release.apk
```
(Same toolchain as `master`: JDK 11 + Android SDK. The new native TCP module compiles automatically.)

### 4. Push the video to the phone
1. Open **AnReal** on the phone → the **Receiver screen** appears and shows its IP and port, e.g. `192.168.100.20 : 8888`.
2. Tap **Start listening** → "Waiting for the PC to connect…".
3. On the PC, run:
   ```bash
   python send_video.py 192.168.100.20 8888
   ```
   (the IP/port are the ones the app shows; the default video path is `src/media/videos/wena.mp4`).
4. The phone shows `connected → receiving NN% → done`, then opens the main screen using **your** video.

### 5. Run the exercise
Place the phone in the headset and bend forward — at ~30° the live camera switches to the trajectory video you just sent.

> **Escape hatch:** on the Receiver screen, tap **Use bundled video instead** to skip the transfer and run with the sample video (same behavior as `master`).
>
> **To send a different video:** relaunch the app and repeat step 4.

---

## How the transfer works (for reviewers)
- The app's native module `TcpReceiver` (`main/java/com/principal/TcpReceiverModule.kt`) opens a `ServerSocket` on port 8888 on a background thread.
- Wire protocol: the PC sends an 8-byte big-endian file size, then the file bytes; the app streams them (64 KB chunks) to app-private storage (`filesDir/received_trajectory.mp4`) and plays it via `react-native-video` from a `file://` URI.
- Everything is local to the LAN; nothing is uploaded to the internet.

---

## Troubleshooting

- **"not on Wi-Fi" / no IP shown:** the phone is not on a Wi-Fi network. Connect it to Wi-Fi (or enable the phone's hotspot and join it from the PC).
- **`send_video.py` times out or "connection refused":** the IP is wrong, or the two devices are not on the same network. Re-check the IP shown in the app, and make sure you tapped **Start listening** first.
- **Same Wi-Fi but it still won't connect:** many guest/campus networks use *client isolation* (devices can't reach each other). Fix: turn on the phone's hotspot and join it from the PC — the phone is still the server, so the transfer still works.
- **`PORT_IN_USE`:** another app holds port 8888, or a previous session is still bound. Close and reopen the app, then tap **Start listening** again.
- **Transfer starts then fails:** keep the app in the foreground during the transfer; if Wi-Fi drops, the partial file is discarded — just retry.
- **Sent a new video but the old one still plays:** relaunch the app and receive again (the receiver overwrites the previous file each time).

---

## Notes
- This branch is **not** merged into `master`. `master` keeps the simpler download-and-install model.
- No self-serve APK is published as a release yet; build it from this branch (step 3). A release can be added once the transfer is verified on a device.
- The trigger angle (~30°) lives in the app (`PrincipalScreen.tsx` / `DoubleCamera3.kt`), not in the Python scripts.
