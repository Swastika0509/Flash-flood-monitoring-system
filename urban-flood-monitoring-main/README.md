# Flash Flood Monitoring and Control in Urban Areas

### Smart, Real-Time Urban Flood Detection & Management System

This project aims to **monitor, predict, and control flash floods** in urban areas using a combination of **IoT sensors**, **AI/ML models**, and **GIS-based visualization**.  
It provides **real-time alerts**, **predictive insights**, and **automated control strategies** to help mitigate flood impacts on city infrastructure and citizens.

---

## Project Overview

**Flash Flood Monitoring and Control System** integrates multiple technologies to:
- Collect live **rainfall**, **drainage**, and **water level data** via **IoT sensors**  
- Predict flood likelihood using **machine learning** models  
- Visualize affected areas on a **GIS-powered dashboard**  
- Send **early warnings** to citizens via app notifications  
- Suggest **control strategies** for authorities (e.g., drainage activation, traffic rerouting)

---

## System Architecture
[ IoT Sensors ] → [ Data Server / API ] → [ AI/ML Prediction Engine ] → [ GIS Dashboard ] → [ Citizen Alert App ]

Components:
- 🌦️ **IoT Sensor Network** – Gathers real-time rainfall and drainage data  
- 🧮 **ML Flood Prediction Model** – Trained to estimate flood probability  
- 🗺️ **GIS Dashboard** – Visual interface for monitoring flood-prone areas  
- 📱 **Alert App / Web Portal** – Sends notifications and guidance  
- 🧭 **Control Module** – Recommends mitigation actions  

---

## 🧰 Tech Stack

| Component | Technology Used |
|------------|------------------|
| IoT Sensors | Arduino / ESP32 / Raspberry Pi |
| Backend API | Python (FastAPI / Flask) |
| AI/ML Model | scikit-learn / TensorFlow |
| Frontend Dashboard | React / Node.js |
| Database | MongoDB / PostgreSQL |
| GIS Mapping | Leaflet / Mapbox / QGIS |
| Cloud & Deployment | AWS / Azure / Render |
| Notifications | Firebase / Twilio / Custom REST API |

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
git clone https://github.com/anishaalmao/urban-flood-monitoring.git
cd urban-flood-monitoring

### 2️⃣ Setup Environment
python -m venv venv
venv\Scripts\activate     # (Windows)
source venv/bin/activate  # (Mac/Linux)

Install dependencies:
pip install -r requirements.txt

For frontend:
cd urban-flood-frontend
npm install
npm start

3️⃣ Add Environment Variables
Create a .env file in the root directory:
API_KEY=your_api_key_here
DB_URI=your_database_uri_here
MAPBOX_TOKEN=your_mapbox_token_here

Run Backend API:
python main.py

Run Frontend:
cd urban-flood-frontend
npm start

Access the dashboard at:
http://localhost:3000

Features
✅ Real-time rainfall & water-level monitoring
✅ Machine Learning-based flood prediction
✅ Interactive GIS flood map visualization
✅ Automated citizen alerts (SMS / Push)
✅ Admin panel for control strategies
✅ Scalable modular architecture

