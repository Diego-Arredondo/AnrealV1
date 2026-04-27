# AnReal v1.0 — Extended Reality System for Simulated Movement

AnReal is a low-cost, Android-based extended reality (XR) system designed to create the illusion of movement beyond a user's current physical capability. It is intended for use in rehabilitation research, particularly for patients with chronic low back pain (CLBP) and kinesiophobia (fear of movement).

The system combines a live camera feed of the user's real environment with a pre-recorded video trajectory, seamlessly switching between them at a predetermined angle of movement. This creates a visual illusion that the user is completing a full rehabilitation movement (e.g., forward bending), even when their actual range of motion is limited by pain or fear.

A video demonstration is available at: https://tinyurl.com/anrealxr

---

## Repository Structure

```
AnrealV1/
├── main/                     # React Native application (TypeScript)
├── src/                      # Native Android modules (Kotlin, Java, C++)
└── procesamiento_video.py    # Python script for video pre-processing (PC side)
```

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

- Android smartphone with rear camera and IMU sensors (tested on Samsung Galaxy S21 FE)
- Low-cost VR headset compatible with the smartphone (cardboard-type, ~USD 32)
- A Windows/Linux/macOS laptop or desktop for video pre-processing
- Wi-Fi network connecting the smartphone and the PC

---

## Software Requirements

### Android App
- Android 8.0 (API level 26) or higher
- Android Studio (Arctic Fox or later) for building from source
- Node.js 16+ and React Native CLI

### PC (Video Pre-processing)
- Python 3.8+
- OpenCV: `pip install opencv-python`
- NumPy: `pip install numpy`

---

## Installation and Usage

### Step 1 — Pre-process the trajectory video (PC)

Before running the app, a trajectory video must be recorded and processed on the PC. A researcher records the expected movement trajectory on the smartphone using a lightweight adjustable rig (e.g., a tripod and office chair), while the participant is getting familiar with the headset.

Run the processing script on the PC to crop and prepare the video:

```bash
python procesamiento_video.py
```

Edit the following variables at the bottom of `procesamiento_video.py` to match your paths:

```python
input_dir  = '/path/to/raw/videos'
mid_dir    = '/path/to/intermediate/output'
output_dir = '/path/to/app/src/media/videos'
input_name = 'your_video.mp4'
```

The script will:
- Crop the video to remove the edges and match the VR headset field of view
- Allow you to interactively select the key frame where the forward movement begins (press `c`) and ends (press `q`)
- Output a processed video file ready to be used by the app

The processed video is transferred to the smartphone via Wi-Fi/TCP and placed in the app's media directory.

### Step 2 — Build and install the Android app

1. Clone this repository:
   ```bash
   git clone https://github.com/Diego-Arredondo/AnrealV1.git
   cd AnrealV1
   ```

2. Install JavaScript dependencies:
   ```bash
   cd main
   npm install
   ```

3. Open the `/src` folder in Android Studio to build the native modules, or build the full project:
   ```bash
   npx react-native run-android
   ```

4. The app will launch on the connected Android device.

### Step 3 — Run the rehabilitation exercise

1. Place the smartphone in the VR headset.
2. Launch the AnReal app. The participant will initially see the camera preview of the real environment.
3. Ask the participant to perform the forward bending exercise. When they reach the threshold angle (~30°), the app automatically switches to the simulated trajectory video, extending the apparent range of motion.
4. The app cycles through camera preview and trajectory simulation across three sets of 10 repetitions.

---

## Key Technical Details

- **Camera stream**: handled via Android Camera2 API in a native Kotlin/Java module, duplicated into two stereo streams for the VR headset at 30 Hz.
- **IMU reading**: accelerometer, gyroscope, and magnetometer accessed via Android SensorManager API at ≥60 Hz.
- **View transition**: the React Native bridge communicates between the native camera module and the RN video player. The video is pre-buffered off-screen and the transition is triggered when the live pitch exceeds the threshold angle.
- **Video playback**: handled via `react-native-video` library with frame-accurate synchronization to the user's inclination angle at the moment of switching.

---

## Known Limitations (v1.0)

- The transition between camera view and video may produce a brief visual discontinuity due to overhead introduced by the React Native bridge. This is addressed in subsequent versions.
- The Wi-Fi/TCP connection between the PC and the smartphone is required for video transfer prior to each session.
- Currently supports one exercise (forward bending). Additional exercises require recording new trajectory videos.

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