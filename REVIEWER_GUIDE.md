# AnReal — Reviewer Guide (Stage 0 and how to evaluate the app)

This guide is for reviewers evaluating the AnReal SoftwareX submission. It explains the **two roles**
in the system and the fastest way to see the app working, and it documents **Stage 0** — the one-time
content-preparation step performed by the researcher (in real use, a healthcare professional) before any
participant session.

For full toolchain/setup details and troubleshooting, see the main [README](README.md).

---

## The two roles

AnReal v1.0 separates two roles, mirroring real clinical use:

| Role | Who | What they do |
|------|-----|--------------|
| **Content preparer** | Researcher / healthcare professional | Performs **Stage 0** once per trajectory: records the movement video, processes it, and compiles it into the app. |
| **Participant** | Patient / end user | Just opens the app and performs the exercise. The trajectory is already embedded; no setup. |

This is the same division a clinician would use: the trajectory is prepared **once**, and each patient
simply runs the prepared app. Because the heavy preparation is already done, **installing and trying the
app requires no PC, server, or configuration** — which also makes reviewing fast.

---

## Fastest way to review (recommended)

A **pre-built APK** (Stage 0 already done) lets you evaluate the app with zero setup:

1. **Download `app-release.apk`** from the [Releases page](https://github.com/Diego-Arredondo/AnrealV1/releases/latest), then install it on an Android phone (Android 8+):
   - via USB: `adb install -r app-release.apk`, **or**
   - copy `app-release.apk` to the phone and open it (allow "install unknown apps").
2. Open **AnReal** and grant the **Camera** permission.
3. Place the phone in the cardboard VR headset (or simply hold it) and **bend forward**.
   When the inclination crosses the threshold angle (~**30°**), the live camera feed switches to the
   **pre-recorded trajectory video**, creating the illusion of completing the full movement.

The app runs **standalone** — no Metro, no cable, no Wi-Fi, no development server.

> The APK is published on the repository's [Releases page](https://github.com/Diego-Arredondo/AnrealV1/releases/latest).
> You can also build it yourself — see [README](README.md) → *Step 2 → Option A (Standalone release APK)*.

---

## Stage 0 — Preparing a trajectory (what the content preparer does once)

This is the workflow a researcher/clinician runs to turn a raw recording into the trajectory the app plays.

### 0.1 — Record the movement
Mount the phone on a lightweight adjustable rig (e.g., tripod + office chair) that follows the **intended
full movement** (for v1.0, a complete forward lumbar bend), and record one steady clip from the
participant's viewpoint. The recording should contain the complete trajectory you want the app to simulate.

### 0.2 — Process it with `procesamiento_video.py` (the `c` and `q` keys)
This step crops the clip to the VR field of view, selects the relevant movement segment, and builds the
seamless "go-and-return" loop the app needs. A raw video will **not** work without it (see *Why preprocessing
is required* below).

1. Install the Python dependencies (PC):
   ```bash
   pip install opencv-python numpy
   ```
2. Edit the paths in the `__main__` block at the bottom of [`procesamiento_video.py`](procesamiento_video.py):
   ```python
   input_name = "my_recording.mp4"                       # raw clip
   input_dir  = "/path/to/raw/videos"
   mid_dir    = "/path/to/intermediate"
   output_dir = "/path/to/AnrealV1/src/media/videos"     # the app's media folder
   name       = "wena.mp4"                               # the app loads src/media/videos/wena.mp4
   ```
3. Run it:
   ```bash
   python procesamiento_video.py
   ```
4. A preview window opens. Watch the movement and press:
   - **`c`** — at the **start** of the relevant forward movement (begins the repetition counter).
   - **`q`** — at the **end** of the forward movement (marks the trajectory endpoint).

   The script then writes the processed clip to `src/media/videos/wena.mp4`.

> The trigger **angle** is *not* set here — it lives in the app (`anguloVideo`, default 30°, in
> `PrincipalScreen.tsx` / `DoubleCamera3.kt`). Stage 0 is only about the **video content**.

### 0.3 — Compile the trajectory into the app
Build the standalone release APK (the embedded JS bundle now includes the new `wena.mp4`):
```bash
cd android
./gradlew app:assembleRelease        # gradlew.bat on Windows
```
The APK is written to `android/app/build/outputs/apk/release/app-release.apk`. Distribute it to the
participant's phone — they only need to install and run it.

---

## Why preprocessing is required (and a raw video is not enough)

`procesamiento_video.py` performs three transformations the raw recording lacks:

1. **Crop to the VR field of view** — the headset shows only a central region per eye; the raw frame would
   be misframed in stereo.
2. **Select the trajectory segment** (`c`/`q`) — picks *which* part of the recording is the actual movement,
   discarding lead-in/lead-out footage.
3. **Build the go-and-return loop** — appends the segment **in reverse** so the simulation advances (continues
   the bend) and then returns smoothly; a raw clip would not loop back and the illusion would break.

It also normalizes resolution, frame rate (30 fps), and codec to what the player expects.

---

## What to look for when reviewing

- The **seamless transition** from the live camera to the trajectory video at the threshold angle.
- The trajectory **continues beyond the participant's actual range of motion** — the core illusion.
- **Standalone operation**: the app needs no external server at runtime.
- The realistic **division of roles**: preparation (Stage 0) is decoupled from participant use.

---

## Roadmap note

This guide describes the **v1.0 model**, where Stage 0 is performed by the content preparer and the
trajectory is embedded into the distributed app. A separate branch explores an alternative where end users
record/load their own trajectory video from within the app; that is out of scope for this version.
