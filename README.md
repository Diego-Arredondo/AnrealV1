# AnReal v1.0 — Extended Reality System for Simulated Movement (self-serve build)

AnReal is a low-cost, Android-based extended reality (XR) system designed to create the illusion of movement beyond a user's current physical capability. It is intended for use in rehabilitation research, particularly for patients with chronic low back pain (CLBP) and kinesiophobia (fear of movement).

The system combines a live camera feed of the user's real environment with a pre-recorded video trajectory, seamlessly switching between them at a predetermined angle of movement. This creates a visual illusion that the user is completing a full rehabilitation movement (e.g., forward bending), even when their actual range of motion is limited by pain or fear.

A video demonstration is available at: https://tinyurl.com/anrealxr

> **This is the `self-serve` branch.** The app does **not** embed the trajectory video — instead you
> **provide your own** and stream it to the phone over Wi-Fi at runtime. A ready-to-install
> **self-serve APK** is published in the Releases, so you do not need to build the app. (The `master`
> branch is the simpler model: a single APK with a fixed trajectory baked in.)

---

## System Overview

AnReal operates in two modes:

1. **Camera preview mode** — the user sees their real environment in real time through the phone's rear camera, shown through the VR headset.
2. **Trajectory simulation mode** — at a predetermined inclination angle, the app seamlessly switches to a pre-recorded video that continues the expected movement, creating the illusion that the user has moved further than they actually did.

The app reads the device's IMU (accelerometer + magnetometer) through the Android `SensorManager` and fuses them into a pitch angle to detect the inclination; the transition between modes is designed to be imperceptible. The live camera feed is duplicated into two stereo views for the headset via the Android Camera2 API, and the trajectory video is played with `react-native-video`.

---

## Illustration of the mechanism

The video below shows the basis of how the device works. The trajectory has two main stages: the real view of the environment and its simulation. Once the person reaches their lumbar-flexion limit, the system continues with the simulated movement.

https://github.com/Diego-Arredondo/AnReal/assets/53983520/ddc11e3e-2f08-4fc2-9d31-cb82ccbe9ac1

---

## The self-serve pipeline (overview)

- **Step 0 — Record** the trajectory video **in the same environment where the exercise will be performed**.
- **Step 1 — Process** it with `procesamiento_video.py` (mark the movement with the `c` / `q` keys).
- **Step 2 — Install** the self-serve app (download the APK — no build).
- **Step 3 — Serve & transfer** the video from the PC to the phone over Wi-Fi (TCP).
- **Step 4 — Run** the exercise: at ~30° the live camera switches to your trajectory video.

---

## Requirements

**To use it:**
- An **Android** phone: **Android 8+** (minSdk 21), **arm64-v8a**, with a **rear camera + accelerometer + magnetometer**. Tested on a **Samsung Galaxy S21 FE**.
- A low-cost cardboard-type **VR headset**.
- The **phone and PC on the same Wi-Fi** (or the PC joined to the phone's hotspot).

**To prepare the trajectory video (PC):**
- **Python 3.8+** with `opencv-python` and `numpy` (for `procesamiento_video.py`). The sender `send_video.py` uses only the standard library.

> **Device note:** the stereo / VR-overlay sizing is calibrated for the Samsung Galaxy S21 FE screen; on markedly different screen sizes the alignment with the headset lenses may need tuning. (Android only — no iOS build.)
>
> Building the app from source is **optional** — see the appendix at the end. The prebuilt APK in the Releases is enough to use it.

---

## Repository Structure

```
AnrealV1/
├── procesamiento_video.py             # Step 1: trajectory-video pre-processing (PC)
├── send_video.py                      # Step 3: pushes the video to the phone over TCP (PC)
├── App.tsx, index.js, app.json, package.json, …   # React Native entry + config
├── src/                               # React Native app (TypeScript)
│   └── screens/                       # ReceiverScreen (entry), PrincipalScreen, …
├── main/                              # Native Android sources (Kotlin/Java/C++) + resources
│   └── java/com/principal/            # TcpReceiverModule.kt (TCP server), CameraModule.kt, …
└── android/                           # Gradle project (only needed to build from source)
```

---

## Step 0 — Record the trajectory (record it in the session environment)

**Record the movement in the exact place where the participant will perform the exercise** — same room,
same furniture and background, same lighting, and the same camera height, angle, and starting orientation
the participant will have.

Why this matters: the illusion depends on the pre-recorded trajectory **blending seamlessly** with what
the participant currently sees through the live camera. The app switches from the live feed to the video
at the threshold angle; if the video was filmed in a different place, that switch is visually jarring and
breaks the immersion. Recording in the session environment makes the cut imperceptible.

Practically: mount the phone on a lightweight adjustable rig (e.g., tripod + chair) at the participant's
viewpoint, and record one steady clip of the **complete intended movement** (a full forward lumbar bend).
Copy the clip to the PC.

## Step 1 — Process the video

Get `procesamiento_video.py` (attached to the self-serve release, or from this repo), edit the path
variables in its `__main__` block:
```python
input_name = "my_recording.mp4"                       # your raw clip
input_dir  = "/path/to/raw/videos"
mid_dir    = "/path/to/intermediate"
output_dir = "/path/to/output"                        # where wena.mp4 is written
name       = "wena.mp4"
```
Then run it and mark the trajectory on the preview window:
```bash
python procesamiento_video.py
```
- Press **`c`** at the **start** of the forward movement.
- Press **`q`** at its **end**.

The script crops the clip to the headset field of view, builds the seamless go-and-return loop, normalizes
fps/resolution, and writes the processed `wena.mp4`.

## Step 2 — Install the self-serve app

Download from the **self-serve release** — no build required:
**https://github.com/Diego-Arredondo/AnrealV1/releases/tag/v1.0-selfserve**

It provides `AnReal-v1.0-selfserve.apk` plus `send_video.py` and `procesamiento_video.py`. Install the APK
on the phone:
```bash
adb install -r AnReal-v1.0-selfserve.apk
```
(or copy the APK to the phone and open it, allowing *install from unknown sources*).

## Step 3 — Serve the video to the phone (TCP, same Wi-Fi)

1. Put the **phone and PC on the same Wi-Fi** (or enable the phone's hotspot and join it from the PC).
2. **Open AnReal.** It starts on the Receiver screen and shows the phone's IP and port, e.g. `192.168.100.14 : 8888`.
3. Tap **Start listening** → it reads *"Waiting for the PC to connect…"*.
4. On the PC, run `send_video.py` with the IP shown on the phone:
   ```bash
   python send_video.py 192.168.100.14 8888 wena.mp4
   ```
   The progress climbs to `Sending... 100%` / `Sent N bytes`.
5. The phone moves through `connected → receiving NN% → done` and opens the main screen using your video.

> To verify the transfer plumbing before a real recording, send any sample clip and confirm it plays. To
> send a different video later, relaunch the app and repeat from step 3.2. The Receiver screen also has a
> **"Use bundled video instead"** escape hatch.

## Step 4 — Run the exercise

Place the phone in the headset and have the participant bend forward. At ~30° the live camera switches to
the trajectory video you sent.

---

## How the transfer works

The app's native module `TcpReceiver` (`main/java/com/principal/TcpReceiverModule.kt`) opens a `ServerSocket`
on port 8888 on a background thread — the **phone is the server**; the PC connects and pushes. Wire protocol:
the PC sends an 8-byte big-endian file size, then the bytes; the app streams them (64 KB chunks) to
app-private storage (`filesDir/received_trajectory.mp4`) and plays it from a `file://` URI. Everything is
local to the LAN — nothing is uploaded to the internet.

---

## Troubleshooting

- **"not on Wi-Fi" / no IP shown:** connect the phone to Wi-Fi (or enable its hotspot and join from the PC).
- **`send_video.py` times out / "connection refused":** wrong IP, or not on the same network. Re-check the IP shown in the app, and make sure you tapped **Start listening** first.
- **Same Wi-Fi but no connection:** many guest/campus networks use *client isolation*. Fix: turn on the phone's hotspot and join it from the PC — the phone is still the server, so it works.
- **`PORT_IN_USE`:** another app holds port 8888, or a previous session is still bound. Reopen the app and tap **Start listening** again.
- **Transfer starts then fails:** keep the app in the foreground; if Wi-Fi drops, the partial file is discarded — retry.
- **Sent a new video but the old one still plays:** relaunch the app and receive again (it overwrites the previous file).

---

## Appendix — Building the app from source (optional)

Only needed if you want to modify the app; otherwise use the prebuilt APK from the release (Step 2).

Toolchain: **Node.js** (16–18; newer needs `npm install --legacy-peer-deps`), **JDK 11** (not 17/21),
**Android SDK** with Platform API 31, Build-Tools 31.0.0, NDK 21.4.7075529, CMake 3.18.1 (via Android Studio).

```bash
git clone -b self-serve https://github.com/Diego-Arredondo/AnrealV1.git
cd AnrealV1
npm install            # add --legacy-peer-deps on Node >= 20
# 1) Debug keystore (not committed):
keytool -genkeypair -v -keystore android/app/debug.keystore -storepass android -alias androiddebugkey \
  -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
# 2) Create android/local.properties with: sdk.dir=/path/to/Android/Sdk
# 3) Set JAVA_HOME to JDK 11 and ANDROID_HOME to the SDK, and add platform-tools to PATH.
# 4) Boost fix: in node_modules/expo-modules-core/android/build.gradle, change the Boost srcUrl host to
#    https://archives.boost.io/release/... (the old boostorg.jfrog.io URL is dead), or manually place
#    boost_1_76_0.tar.gz into node_modules/expo-modules-core/android/build/downloads/.
# 5) Build (the JS bundle is embedded, so the app runs without Metro):
cd android && gradlew.bat app:assembleRelease && cd ..
# 6) Install:
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

---

## Citation

If you use AnReal in your research, please cite:

> Herskovic V., Arredondo D., Torres G., Vidal C., Campos M. (2025). AnReal: an extended reality, low-cost system for simulated movement. *SoftwareX*. [DOI pending]

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Contact

For questions or support, please contact: vherskov@ing.puc.cl
