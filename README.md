# AnReal v1.0 — Extended Reality System for Simulated Movement

AnReal is a low-cost, Android-based extended reality (XR) system designed to create the illusion of movement beyond a user's current physical capability. It is intended for use in rehabilitation research, particularly for patients with chronic low back pain (CLBP) and kinesiophobia (fear of movement).

The system combines a live camera feed of the user's real environment with a pre-recorded video trajectory, seamlessly switching between them at a predetermined angle of movement. This creates a visual illusion that the user is completing a full rehabilitation movement (e.g., forward bending), even when their actual range of motion is limited by pain or fear.

A video demonstration is available at: https://tinyurl.com/anrealxr

> **Reviewers:** start with the [Reviewer Guide](REVIEWER_GUIDE.md). It explains the two roles
> (content preparer vs. participant), **Stage 0** (recording → processing with the `c`/`q` keys →
> compiling), and the fastest way to evaluate the app from a pre-built standalone APK.

---

## Quick start for evaluators

**Download the ready-to-install app:** **[⬇ app-release.apk (latest release)](https://github.com/Diego-Arredondo/AnrealV1/releases/latest)**

1. Copy the APK to an Android phone and open it (allow "install from unknown sources"), or run `adb install -r app-release.apk`.
2. Open **AnReal** and grant the **Camera** permission.
3. Hold the phone — or place it in a cardboard VR headset — and bend forward. At ~30° the live camera switches to the pre-recorded trajectory video.

The app runs **standalone**: no PC, server, cable, or Wi-Fi. See the [Reviewer Guide](REVIEWER_GUIDE.md) for the complete workflow and Stage 0.

### Device compatibility
- **Android only** — this repository contains no iOS build.
- The release APK targets **arm64-v8a** (virtually all phones since ~2017); **Android 8+** recommended (`minSdk 21`). It will not install on 32-bit-only devices or x86 emulators unless rebuilt with extra ABIs (`reactNativeArchitectures` in `android/gradle.properties`).
- Requires a **rear camera + accelerometer + magnetometer**.
- The stereo / VR-overlay sizing is **calibrated for the Samsung Galaxy S21 FE** screen; on devices with very different screen dimensions the alignment with the headset lenses may need tuning.

---

## Repository Structure

```
AnrealV1/
├── App.tsx                   # React Native root component (NavigationContainer)
├── index.js                  # Registers the root component "Principal"
├── app.json                  # App name / displayName
├── package.json              # JavaScript dependencies and scripts
├── babel.config.js           # Babel (babel-preset-expo)
├── metro.config.js           # Metro bundler config (adds .mp4 to assetExts)
├── tsconfig.json             # TypeScript config
├── react-native.config.js    # Points the RN CLI at main/AndroidManifest.xml (non-standard layout)
│
├── src/                      # React Native application (TypeScript)
│   ├── navigator/            # StackNavigator
│   ├── screens/              # PrincipalScreen, DoubleCameraScreen, VideoScreens
│   ├── theme/                # appTheme
│   └── media/                # VR overlay image and trajectory videos (src/media/videos/wena.mp4)
│
├── main/                     # Native Android modules (Kotlin/Java/C++) + resources
│   ├── AndroidManifest.xml
│   ├── java/com/principal/   # CameraModule.kt, DoubleCamera3.kt, MainActivity, MainApplication
│   ├── res/                  # layouts, drawables, mipmaps, strings
│   └── jni/                  # New Architecture C++ (kept for reference; New Arch is disabled)
│
├── android/                  # Gradle project; its app source sets point at ../main
│
└── procesamiento_video.py    # Python script for video pre-processing (PC side)
```

> **Note on layout.** To preserve the structure used in the publication, the React Native
> sources live under `src/` and the native Android sources under `main/` (instead of the
> conventional `android/app/src/main/...`). Two files bridge this non-standard layout:
> `react-native.config.js` (tells the JS CLI where the manifest is) and `sourceSets` in
> [`android/app/build.gradle`](android/app/build.gradle) (tells Gradle where the native sources are).

---

## Ilustración del mecanismo

A continuación se muestra la base del funcionamiento del dispositivo. La trayectoria se compone de 2 etapas principales: la vista real del entorno y la simulación de este. Una vez que la persona llega a su límite de flexión lumbar el sistema continúa con la simulación del movimiento.

https://github.com/Diego-Arredondo/AnReal/assets/53983520/ddc11e3e-2f08-4fc2-9d31-cb82ccbe9ac1

---

## System Overview

AnReal operates in two modes:

1. **Camera preview mode**: the user sees their real environment in real time through the smartphone rear camera, displayed via the VR headset.
2. **Trajectory simulation mode**: at a predetermined inclination angle, the app seamlessly switches to a pre-recorded video that continues the expected movement trajectory, creating the illusion that the user has moved further than they actually did.

The system uses the device's IMU sensors (accelerometer, gyroscope, magnetometer) to detect the user's inclination in real time. The transition between modes is designed to be imperceptible to the user.

---

## Hardware Requirements

- Android smartphone with rear camera and IMU sensors (tested on Samsung Galaxy S21 FE, Android 12+)
- Low-cost VR headset compatible with the smartphone (cardboard-type, ~USD 32)
- A Windows/Linux/macOS laptop or desktop for video pre-processing and for building the app
- Wi-Fi network connecting the smartphone and the PC (only needed for development with the Metro dev server)

---

## Software Requirements

### Android App (toolchain — versions matter)
- **Node.js** (the project targets Node 16–18; on newer Node use `npm install --legacy-peer-deps`)
- **JDK 11** — *required*. Newer JDKs (17/21) are incompatible with Gradle 7.5.1 / AGP 7.2 and will fail the build.
- **Android SDK** with: **Platform API 31**, **Build-Tools 31.0.0**, **Platform-Tools** (adb), **NDK 21.4.7075529**, **CMake 3.18.1**
- React Native **0.70.5** + Expo SDK **47** (bare workflow), installed via `npm install`
- Gradle **7.5.1** (via the wrapper), Android Gradle Plugin **7.2.1**, Kotlin **1.6.10**
- The easiest way to obtain the SDK + NDK + CMake is **Android Studio** (its SDK Manager).

> The New Architecture (Fabric/TurboModules) is **disabled** (`newArchEnabled=false`). The files
> under `main/jni/` and `main/java/com/principal/newarchitecture/` are kept as published but are not
> part of the active build.

### PC (Video Pre-processing)
- Python 3.8+
- OpenCV: `pip install opencv-python`
- NumPy: `pip install numpy`

---

## Installation and Usage

### Step 1 — Pre-process the trajectory video (PC)

A researcher records the expected movement trajectory (e.g., a full forward bend) using a lightweight
adjustable rig (tripod + office chair), while the participant gets familiar with the headset.

Edit the configuration variables in the `__main__` block at the bottom of `procesamiento_video.py`:

```python
input_name = "alto.mp4"                              # raw video file name
input_dir  = "/path/to/raw/videos"                   # folder that contains input_name
mid_dir    = "/path/to/intermediate"                 # folder for the cropped intermediate file
output_dir = "/path/to/AnrealV1/src/media/videos"    # the app's media folder
name       = "wena.mp4"                              # output file name (the app loads src/media/videos/wena.mp4)
```

Then run it and mark the trajectory interactively:

```bash
python procesamiento_video.py
```
- Press `c` to start the repetition counter (the point where the forward movement begins).
- Press `q` to set the key frame where the forward movement ends.

The script crops the video to the headset field of view and writes the processed clip to
`src/media/videos/wena.mp4`. The app bundles this file at build time
(`PrincipalScreen` loads it with `require('../media/videos/wena.mp4')`), so **to use a new
trajectory you replace that file and rebuild** (release) or reload (development).

### Step 2 — Build the Android app

Common setup (do this once):

```bash
git clone https://github.com/Diego-Arredondo/AnrealV1.git
cd AnrealV1
npm install            # add --legacy-peer-deps on Node >= 20
```

1. **Generate the debug keystore** (not committed):
   ```bash
   keytool -genkeypair -v -keystore android/app/debug.keystore \
     -storepass android -alias androiddebugkey -keypass android \
     -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
   ```
2. **Gradle wrapper** — already included in `android/`. (Only if it is ever missing, regenerate with
   `cd android && gradle wrapper --gradle-version 7.5.1 && cd ..`, or open `android/` in Android Studio.)
3. **Point Gradle at your SDK** — create `android/local.properties`:
   ```
   sdk.dir=/path/to/Android/Sdk
   ```
4. **Set the environment** so the command line uses JDK 11 and the SDK (example, Windows `cmd`):
   ```cmd
   set "JAVA_HOME=C:\Program Files\Java\jdk-11.x"
   set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
   set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%"
   ```
5. **Boost download fix** (`expo-modules-core`): the original Boost download URL
   (`boostorg.jfrog.io`) is dead. This repo points it at `archives.boost.io`
   ([android/app build chain]). If a fresh `npm install` resets it, re-apply the patch (or use
   `patch-package`) so `:expo-modules-core:prepareBoost` can unpack a valid `boost_1_76_0.tar.gz`.

#### Option A — Standalone release APK (recommended for distribution)

Produces a single self-contained APK with the JS bundle embedded — runs without Metro, cable or Wi-Fi.

```bash
cd android
./gradlew app:assembleRelease          # gradlew.bat on Windows
```
The APK is written to `android/app/build/outputs/apk/release/app-release.apk` (~28 MB). Share it as-is;
recipients install it (allowing "install unknown apps"). Only `arm64-v8a` is built by default
(see `reactNativeArchitectures` in `android/gradle.properties`); add other ABIs there to widen device support.

Install on a connected device:
```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

> The release APK is signed with the **debug keystore**, which is fine for direct sharing/sideloading.
> For Google Play you must generate your own release keystore — see
> https://reactnative.dev/docs/signed-apk-android.

#### Option B — Development build (live reload via Metro)

For iterating on the JS/video without rebuilding the APK each time.

```bash
# Terminal 1 — start the Metro dev server bound to all interfaces (IPv4 + LAN):
npx react-native start --host 0.0.0.0

# Terminal 2 — build, install and launch the debug app (device connected, USB debugging on):
npx react-native run-android
```
If the app shows the red "Unable to load script / Could not connect to development server" screen:
- Over **USB**: run `adb reverse tcp:8081 tcp:8081`, then reload the app.
- Over **Wi-Fi** (same network): in the app dev menu set *Debug server host & port* to `<PC-LAN-IP>:8081`,
  and allow port 8081 through the PC firewall. (Metro must be started with `--host 0.0.0.0`.)

### Step 3 — Run the rehabilitation exercise

1. Place the smartphone in the VR headset.
2. Launch the AnReal app and grant the **Camera** permission. The participant first sees the camera preview.
3. The participant performs the forward bend. When the measured pitch exceeds the threshold angle
   (`anguloVideo`, default **30°**), the app switches to the simulated trajectory video, extending the
   apparent range of motion.
4. The app cycles through camera preview and trajectory simulation across three sets of 10 repetitions.

---

## Key Technical Details

- **Camera stream**: handled via the Android Camera2 API in a native Kotlin activity (`DoubleCamera3`),
  duplicated into two stereo previews (two `TextureView`s) for the VR headset.
- **Native module bridge**: `CameraModule` (`getName() = "DiegoCamera"`) exposes `openCamera(...)` to
  JavaScript via the React Native bridge and returns the measured angle/series/counter to the JS layer.
- **IMU reading**: the native activity reads the accelerometer and magnetometer through the Android
  `SensorManager` and fuses them (`getRotationMatrix`/`getOrientation`) into a pitch angle that drives the
  camera→video transition. The React Native layer additionally samples the accelerometer through
  `expo-sensors` at ~60 Hz (`setUpdateInterval(16)`) to detect the upright position.
- **View transition**: when the live pitch exceeds `anguloVideo` (default 30°), the native activity
  finishes and the React Native screen plays the pre-recorded trajectory video.
- **Video playback**: via `react-native-video`; the trajectory video is bundled from `src/media/`
  (`metro.config.js` adds `.mp4` to the asset extensions so `require('....mp4')` works).

---

## Known Limitations & Build Notes (v1.0)

- The transition between camera view and video may produce a brief visual discontinuity due to overhead
  introduced by the React Native bridge. This is addressed in subsequent versions.
- During development the JavaScript bundle and assets are served from the PC to the smartphone over Wi-Fi
  by the Metro dev server. The trajectory video is bundled into the app (not streamed at runtime).
- Currently supports one exercise (forward bending). Additional exercises require recording new trajectory videos.
- **Not committed:** `node_modules/` (run `npm install`), `android/local.properties` (your SDK path), and
  `android/app/debug.keystore` (generate it — see Step 2). The Gradle wrapper *is* included.
- **Toolchain pitfalls:** use **JDK 11** (not 17/21); install **NDK 21.4.7075529** + **CMake 3.18.1**; the
  `expo-modules-core` Boost URL must point at `archives.boost.io`.

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
