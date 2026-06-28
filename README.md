# AnReal v1.0 — Extended Reality System for Simulated Movement

AnReal is a low-cost, Android-based extended reality (XR) system designed to create the illusion of movement beyond a user's current physical capability. It is intended for use in rehabilitation research, particularly for patients with chronic low back pain (CLBP) and kinesiophobia (fear of movement).

The system combines a live camera feed of the user's real environment with a pre-recorded video trajectory, seamlessly switching between them at a predetermined angle of movement. This creates a visual illusion that the user is completing a full rehabilitation movement (e.g., forward bending), even when their actual range of motion is limited by pain or fear.

A video demonstration is available at: https://tinyurl.com/anrealxr

> ⚙️ **You are on the `self-serve` branch.** This build adds a workflow to load *your own* trajectory
> video by pushing it from the PC to the app over Wi-Fi at runtime (no rebuild per video). For that,
> follow **[README.selfserve.md](README.selfserve.md)**. The instructions below describe the simpler
> `master` model (a fixed trajectory baked into the APK).

---

## Quick start — install and try it

For this submission the trajectory has already been prepared and embedded into the app (see **Stage 0** below), so **you only need to install a single APK** — no PC, build step, server, cable, or configuration.

1. **Download the app:** [⬇ app-release.apk (latest release)](https://github.com/Diego-Arredondo/AnrealV1/releases/latest)
2. Install it on an Android phone: copy the file to the phone and open it (allow *install from unknown sources*), **or** run `adb install -r app-release.apk`.
3. Open **AnReal** and grant the **Camera** permission.
4. Hold the phone — or place it in a cardboard VR headset — and bend forward. When the inclination crosses ~**30°**, the live camera feed switches to the pre-recorded trajectory video, creating the illusion of completing the full movement.

The app runs **standalone**: everything, including the trajectory video, is embedded in the APK.

---

## Requirements

**To install and run the app (all that is needed to evaluate it):**

- An **Android** phone — the app is Android-only (this repository contains no iOS build).
- **Android 8+** (minimum API 21) on an **arm64-v8a** CPU, i.e. essentially any phone from ~2017 onward. The APK does not target 32-bit-only devices or x86 emulators.
- A **rear camera** plus **accelerometer and magnetometer** sensors (used to detect the inclination that triggers the transition).
- A low-cost cardboard-type **VR headset** that fits the phone (~USD 32). Tested on a **Samsung Galaxy S21 FE**.

> **Device note:** the stereo / VR-overlay sizing is calibrated for the Samsung Galaxy S21 FE screen. The app runs on other Android phones, but on markedly different screen sizes the alignment with the headset lenses may need tuning.

A PC with Python/OpenCV and the Android build toolchain is required **only** to reproduce Stage 0 (below); it is **not** needed to install or run the app.

---

## System Overview

AnReal operates in two modes:

1. **Camera preview mode** — the user sees their real environment in real time through the phone's rear camera, shown through the VR headset.
2. **Trajectory simulation mode** — at a predetermined inclination angle, the app seamlessly switches to a pre-recorded video that continues the expected movement, creating the illusion that the user has moved further than they actually did.

The app reads the device's IMU (accelerometer + magnetometer) through the Android `SensorManager` and fuses them into a pitch angle to detect the inclination in real time; the transition between modes is designed to be imperceptible. The live camera feed is duplicated into two stereo views for the headset via the Android Camera2 API, and the trajectory video is played with `react-native-video`.

---

## Illustration of the mechanism

The video below shows the basis of how the device works. The trajectory has two main stages: the real view of the environment and its simulation. Once the person reaches their lumbar-flexion limit, the system continues with the simulated movement.

https://github.com/Diego-Arredondo/AnReal/assets/53983520/ddc11e3e-2f08-4fc2-9d31-cb82ccbe9ac1

---

## Repository Structure

```
AnrealV1/
├── App.tsx, index.js, app.json        # React Native entry point + app config
├── package.json, babel.config.js, metro.config.js, tsconfig.json
├── react-native.config.js             # bridges the non-standard layout to the RN CLI
├── src/                               # React Native app (TypeScript): screens, navigator, media
├── main/                              # Native Android sources (Kotlin/Java/C++) + resources
├── android/                           # Gradle project (app sourceSets point at ../main)
└── procesamiento_video.py             # Stage 0: trajectory-video pre-processing (PC)
```

> The React Native sources live in `src/` and the native Android sources in `main/`, a layout kept for consistency with the publication. `react-native.config.js` and the `sourceSets` block in `android/app/build.gradle` bridge this layout to the build tools.

---

## Stage 0 — preparing the trajectory (already done for this submission)

In real use the system has two roles:

- **Content preparer** (researcher / healthcare professional): performs **Stage 0 once** per trajectory.
- **Participant** (patient): only installs and uses the app — no setup.

**For this submission we have already performed Stage 0** and embedded a sample trajectory into the APK, so reviewers only download and install it (see *Quick start*). This was done for simplicity, and it also mirrors real clinical use, where the clinician prepares the trajectory once and the patient simply runs the prepared app.

For transparency and reproducibility, Stage 0 consists of:

1. **Record** the movement: mount the phone on an adjustable rig (e.g., tripod + chair) and record the full intended movement (a complete forward lumbar bend) from the participant's viewpoint.
2. **Process** it with `procesamiento_video.py` (needs Python 3.8+, `opencv-python`, `numpy`): set the input/output paths in the script, run it, and mark the movement on the preview window — press **`c`** at the start of the forward movement and **`q`** at its end. The script crops the clip to the headset field of view, builds the seamless go-and-return loop, and writes the result to `src/media/videos/wena.mp4`.
3. **Compile** the app so the processed video is bundled in: with JDK 11 and the Android SDK installed, run `gradlew app:assembleRelease`, which produces the standalone APK published in *Quick start*.

This is why the video does not need to be transferred to the device during a session: it is embedded into the APK in Stage 0, **before** installation. The trigger angle (~30°) lives in the app, not in this script.

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
