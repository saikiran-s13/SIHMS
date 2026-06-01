# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

SI HMS — Smart Infrastructure Health Monitoring System
> **Real-time structural health monitoring platform for bridges, bui ldings, and civi l infrastructure
using IoT sensors, machine learning, and an interactive dashboard.**
![Health Score](https://img.shields.io/badge/Health_Engine-Random_Forest-00e5a0?style=flat-
square)
![Stack](https://img.shields.io/badge/Stack-React_+_FastAPI_+_TensorFlow-7ab3d4?style=flat-
square)
![Standards](https://img.shields.io/badge/Standards-IS:1893_|_I RC:6_|_ASCE_7-f5a623?
style=flat-square)
![License](https://img.shields.io/badge/License-MIT-white?style=flat-square)
---
##  What Is This?
SI HMS monitors **structural integrity in real time** by col lecting data from deployed sensors
(accelerometers, strain gauges, ti lt sensors, thermistors), running it through an ML-based damage
classification engine, and displaying actionable insights on a live dashboard — helping engineers
make maintenance decisions *before* fai lures happen.
### Why It Matters
- **40% of India's bridges** are over 50 years old and lack continuous monitoring
- Manual inspections happen every 2–5 years — SI HMS provides **24/7 coverage**
- Early warning can save lives and reduce emergency repair costs by **60–70%**
---
##  Project Structure
```
SI HMS/
├── frontend/ ← React dashboard (SI HMS_Dashboard.jsx)
├── backend/
│ ├── main.py ← FastAPI REST API server
│ └── requirements.txt
├── ml_model/
│ └── train_model.py ← Random Forest damage classifier
├── sensor_simulator/
│ └── sensor_simulator.py ← IoT sensor data simulator
└── README.md
``` ##  HOW TO RUN — Step by Step
### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Git
---
### STEP 1 — Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/SI HMS.git
cd SI HMS
```
---
### STEP 2 — Run the Backend API
```bash
cd backend
# Create virtual environment
python -m venv venv
# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
# Instal l dependencies
pip instal l -r requirements.txt
# Start the server
uvicorn main:app --reload --port 8000
```
✅ API is live at: http://local host:8000
📖 Swagger docs at: http://local host:8000/docs ### STEP 3 — Train the ML Model
```bash
cd ml_model
# Instal l ML dependencies
pip instal l scikit-learn numpy pandas
# Train the Random Forest classifier
python train_model.py
```
✅ Model saved to `ml_model/models/damage_classifier.pkl`
You'l l see accuracy metrics and feature importance in the terminal.
---
### STEP 4 — Start the Sensor Simulator
Open a **new terminal window**:
```bash
cd sensor_simulator
pip instal l requests
python sensor_simulator.py
```
✅ 6 sensor streams start transmitting every 5 seconds.
🔴 Critical structures show elevated readings automatical ly.
---
### STEP 5 — Launch the Frontend Dashboard
The dashboard (`SI HMS_Dashboard.jsx`) is a React component.
**Option A — Run in Claude.ai** (easiest):
Paste the `.jsx` fi le content into Claude.ai as an artifact — it runs instantly in the browser.
**Option B — Run in a React project**: ```bash
# Create a new React app
npx create-react-app sihms-frontend
cd sihms-frontend
# Instal l dependencies
npm instal l recharts
# Replace src/App.js with SI HMS_Dashboard.jsx content
# Then run:
npm start
```
✅ Dashboard opens at: http://local host:3000
---
## 🔌 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/structures` | Al l monitored structures |
| GET | `/structures/{id}` | Single structure detai ls |
| GET | `/sensors/live/{id}` | Live sensor readings |
| POST | `/analysis/run` | Run AI damage analysis |
| GET | `/analysis/history/{id}` | 30-day health history |
| GET | `/alerts` | Active alerts across al l structures |
| GET | `/report/{id}` | Generate inspection report |
| GET | `/dashboard/stats` | Summary statistics |
---
## 🤖 ML Model Detai ls
| Property | Value |
|----------|-------|
| Algorithm | Random Forest (150 trees) |
| Features | Vibration, Strain, Ti lt, Frequency, Temperature |
| Classes | Healthy / Minor Damage / Critical |
| Standards | IS:1893-2016, I RC:6, ASCE 7-22 |
| Dataset | Synthetic (replace with ASCE SHM Benchmark) |
| Target Accuracy | ~94% on synthetic data | **Real datasets to use:**
- [ASCE SHM Benchmark](https://www.shmii.org/datasets)
- [PEER Ground Motion Database](https://peer.berkeley.edu)
- [Los Alamos SHM Dataset](https://www.lanl.gov)
---
## 🛠️ Tech Stack
**Frontend:** React, Recharts, CSS animations, Google Fonts (I BM Plex Mono + Syne)
**Backend:** Python, FastAPI, Pydantic, Uvicorn
**ML:** Scikit-learn (Random Forest), NumPy, Pandas
**IoT Layer:** Python threading, HTTP streaming, Gaussian noise simulation
**Standards:** IS:1893-2016, IS:456, I RC:6, NDMA Guidelines
---
##  Roadmap / Future Scope
- [ ] Integrate real IoT hardware (ESP32 + MPU6050 accelerometer)
- [ ] LSTM model for time-series anomaly detection
- [ ] Mobi le app with push notifications
- [ ] GIS map layer with Leaflet.js showing city-wide structure health
- [ ] PDF report auto-generation with ReportLab
- [ ] Role-based access (Engineer / Inspector / Admin)
- [ ] Digital Twin integration (BIM model sync)
---
##  Author
sambangi sai kiran — Civi l Engineering Student
Department of Civi l Engineering
Dr.lankapalli bullayya college of engineering
[![Linked In](https://img.shields.io/badge/Linked In-Connect-blue?style=flat-square)]
(https://linkedin.com/in/sai-kiran-sambangi)
[![GitHub](https://img.shields.io/badge/GitHub-Fol low-black?style=flat-square)]
(https://github.com/saikiran-s13)
---
## 📄 License MIT License — free to use, modify, and distribute with attribution.
---
> *"Infrastructure doesn't fai l suddenly — it degrades slowly. SI HMS makes that degradation
visible."*
