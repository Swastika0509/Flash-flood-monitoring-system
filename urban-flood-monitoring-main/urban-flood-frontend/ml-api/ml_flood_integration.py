# ml_flood_integration.py
import pandas as pd
import numpy as np
import joblib
from flood_alert_system import FloodAlertSystem  # Import your alert system

# ---------- Step 1: Load Model & Scaler ----------
try:
    model = joblib.load('bagging_flood_model.pkl')
    scaler = joblib.load('flood_scaler.pkl')
    print("✅ Model and scaler loaded successfully.")
except Exception as e:
    print(f"❌ Error loading model/scaler: {e}")
    exit(1)

# ---------- Step 2: Initialize Alert System ----------
alert_system = FloodAlertSystem()

# ---------- Step 3: Prepare Sample Input ----------
sample_input = pd.DataFrame({
    'Latitude': [28.6139],          # Example: New Delhi
    'Longitude': [77.2090],
    'Rainfall': [120],              # in mm
    'Temperature': [30],            # in Celsius
    'Humidity': [80],               # in %
    'River Discharge': [500],       # m³/s
    'Water Level': [4.5],           # meters
    'Elevation': [216],             # meters
    'Population Density': [11000]   # per sq km
})

# ---------- Step 4: Apply Feature Engineering (same as training) ----------
sample_input['Flood_Index'] = (
    sample_input['Rainfall'] * 0.5 +
    sample_input['Water Level'] * 0.3 +
    sample_input['River Discharge'] * 0.2
)
sample_input['Rainfall_Elevation'] = sample_input['Rainfall'] / (sample_input['Elevation'] + 1)
sample_input['Water_Level_Discharge'] = sample_input['Water Level'] * sample_input['River Discharge']

# ---------- Step 5: Scale Numeric Features ----------
numeric_cols = sample_input.select_dtypes(include=np.number).columns.tolist()

try:
    sample_input[numeric_cols] = scaler.transform(sample_input[numeric_cols])
except Exception as e:
    print(f"❌ Error scaling input: {e}")
    exit(1)

# ---------- Step 6: Predict Using ML Model ----------
try:
    flood_risk_prob = model.predict_proba(sample_input)[:, 1][0]
    flood_risk_class = model.predict(sample_input)[0]
except Exception as e:
    print(f"❌ Error during prediction: {e}")
    exit(1)

print(f"\n📊 ML Model Output:")
print(f"Flood Risk Probability (0-1): {flood_risk_prob:.4f}")
print(f"Predicted Flood Occurrence Class: {flood_risk_class}")

# ---------- Step 7: Generate Alert Based on Model Probability ----------
alert_data = alert_system.generate_alert(flood_risk_prob)

print("\n🚨 Final Integrated Alert:")
print(alert_data["message"])
print(f"Alert Level: {alert_data['alert_level']}, Color: {alert_data['color']}")