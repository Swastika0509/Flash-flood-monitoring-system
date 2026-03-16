# ml-api/main.py
import os
from typing import Optional

from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
from fastapi.middleware.cors import CORSMiddleware
import logging

# email libs
import smtplib
import ssl
from email.message import EmailMessage

# load .env
from dotenv import load_dotenv
load_dotenv()

# import alert helper
from flood_alert_system import FloodAlertSystem

# ---------------------------
# FastAPI + CORS
# ---------------------------
app = FastAPI(title="Urban Flood ML Model API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # during development; lock this down in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Model & Scaler load
# ---------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "bagging_flood_model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "flood_scaler.pkl")

try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print("✅ Model and scaler loaded successfully.")
except Exception as e:
    print("❌ Error loading model/scaler:", e)
    model, scaler = None, None

alert_system = FloodAlertSystem()

# ---------------------------
# Request schema
# ---------------------------
class LocationInput(BaseModel):
    Latitude: float
    Longitude: float
    preset: Optional[str] = None  # 'settings' -> high-risk sample

# ---------------------------
# Feature engineering & order
# ---------------------------
def compute_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    # same formulas as used in training
    df["Flood_Index"] = df["Rainfall"] * 0.5 + df["Water_Level"] * 0.3 + df["River_Discharge"] * 0.2
    df["Rainfall_Elevation"] = df["Rainfall"] / (df["Elevation"] + 1)
    df["Water_Level_Discharge"] = df["Water_Level"] * df["River_Discharge"]
    return df

FEATURE_ORDER = [
    "Latitude", "Longitude", "Rainfall", "Temperature", "Humidity",
    "River_Discharge", "Water_Level", "Elevation", "Population_Density",
    "Flood_Index", "Rainfall_Elevation", "Water_Level_Discharge"
]

# ---------------------------
# Prediction endpoint
# ---------------------------
@app.post("/predict/alert")
def predict_alert(data: LocationInput):
    """
    Accepts Latitude, Longitude and optional preset.
    If preset == 'settings' -> uses the high-risk hardcoded sample.
    Returns sensor_data (friendly), flood_probability (0-1), alert_level, color, message.
    """
    if model is None or scaler is None:
        raise HTTPException(status_code=500, detail="Model or scaler not loaded")

    try:
        # choose sample values
        if (data.preset or "").lower() == "settings":
            raw = {
                "Latitude": float(data.Latitude),
                "Longitude": float(data.Longitude),
                "Rainfall": 6000.0,
                "Temperature": 38.0,
                "Humidity": 99.0,
                "River_Discharge": 60000.0,
                "Water_Level": 25.0,
                "Elevation": 2.0,
                "Population_Density": 99000.0,
            }
        else:
            raw = {
                "Latitude": float(data.Latitude),
                "Longitude": float(data.Longitude),
                "Rainfall": 1.0,
                "Temperature": 42.0,
                "Humidity": 15.0,
                "River_Discharge": 20.0,
                "Water_Level": 0.5,
                "Elevation": 450.0,
                "Population_Density": 1000.0,
            }

        df = pd.DataFrame([raw])
        df = compute_engineered_features(df)

        # ensure feature order present
        missing = [c for c in FEATURE_ORDER if c not in df.columns]
        if missing:
            raise HTTPException(status_code=500, detail=f"Missing feature columns: {missing}")

        X = df[FEATURE_ORDER].values

        # debug prints in server logs
        try:
            expected = getattr(scaler, "n_features_in_", None)
            if expected is not None:
                print(f"Scaler expects {expected} features; we provide {len(FEATURE_ORDER)}")
            X_scaled = scaler.transform(X)
        except Exception as e:
            print("❌ Scaler transform error:", e)
            raise HTTPException(status_code=500, detail=f"Scaler transform error: {e}")

        try:
            flood_prob = model.predict_proba(X_scaled)[:, 1][0]  # continuous 0-1
        except Exception as e:
            print("❌ Model prediction error:", e)
            raise HTTPException(status_code=500, detail=f"Model prediction error: {e}")

        alert_data = alert_system.generate_alert(flood_prob)

        # prepare sensor data for display (frontend expects these friendly keys)
        sensor_display = {
            "Latitude": raw["Latitude"],
            "Longitude": raw["Longitude"],
            "Rainfall": raw["Rainfall"],
            "Temperature": raw["Temperature"],
            "Humidity": raw["Humidity"],
            "River Discharge": raw["River_Discharge"],
            "Water Level": raw["Water_Level"],
            "Elevation": raw["Elevation"],
            "Population Density": raw["Population_Density"],
        }

        return {
            "latitude": raw["Latitude"],
            "longitude": raw["Longitude"],
            "sensor_data": sensor_display,
            "flood_probability": round(float(flood_prob), 4),
            "alert_level": alert_data["alert_level"],
            "color": alert_data["color"],
            "message": alert_data["message"],
        }

    except HTTPException:
        raise
    except Exception as e:
        print("❌ Unexpected error in predict_alert:", e)
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------
# Notification endpoint (smtplib)
# --------------------------

# add these env parses near top-level or reuse existing pattern
mail_user = os.getenv("MAIL_USERNAME")
mail_pass = os.getenv("MAIL_PASSWORD")
mail_from = os.getenv("MAIL_FROM", mail_user)
mail_server = os.getenv("MAIL_SERVER", "smtp.gmail.com")
mail_port = int(os.getenv("MAIL_PORT", "587"))
mail_starttls = os.getenv("MAIL_STARTTLS", "True").lower() in ("true", "1", "yes")
mail_ssl_tls = os.getenv("MAIL_SSL_TLS", "False").lower() in ("true", "1", "yes")
mail_debug = os.getenv("MAIL_DEBUG", "False").lower() in ("true", "1", "yes")

logger = logging.getLogger("uvicorn.error")  # or your logger

@app.post("/notify/all")
async def notify_all(
    email: Optional[str] = Body(None),
    phone: Optional[str] = Body(None),
    subject: Optional[str] = Body("🚨 Flood Alert"),
    message: Optional[str] = Body("Flood warning in your area.")
):
    results = {}
    if not email and not phone:
        return {"status": "no_targets", "detail": "No email or phone provided"}

    # EMAIL
    if email:
        try:
            msg = EmailMessage()
            msg["Subject"] = subject
            msg["From"] = mail_from
            msg["To"] = email
            msg.set_content(message)

            context = ssl.create_default_context()

            # Choose implicit SSL or STARTTLS
            if mail_ssl_tls:
                # Implicit SSL (usually port 465)
                logger.info("Using implicit SSL SMTP to %s:%s", mail_server, mail_port)
                with smtplib.SMTP_SSL(mail_server, mail_port, context=context, timeout=30) as smtp:
                    smtp.set_debuglevel(1 if mail_debug else 0)
                    if mail_user and mail_pass:
                        smtp.login(mail_user, mail_pass)
                    smtp.send_message(msg)
            else:
                # Plain SMTP + optional STARTTLS (port 587 typical)
                logger.info("Using SMTP to %s:%s (STARTTLS=%s)", mail_server, mail_port, mail_starttls)
                with smtplib.SMTP(mail_server, mail_port, timeout=30) as smtp:
                    smtp.set_debuglevel(1 if mail_debug else 0)
                    smtp.ehlo()  # identify ourselves
                    if mail_starttls:
                        smtp.starttls(context=context)
                        smtp.ehlo()  # re-identify after TLS
                    if mail_user and mail_pass:
                        smtp.login(mail_user, mail_pass)
                    smtp.send_message(msg)

            logger.info("✅ Email sent to %s", email)
            results["email"] = "sent"
        except smtplib.SMTPAuthenticationError as e:
            logger.error("❌ Email auth error: %s", e)
            results["email"] = f"auth_error: {e}"
        except Exception as e:
            logger.exception("❌ Email error:")
            results["email"] = f"error: {e}"

    # SMS placeholder - keep existing behavior
    if phone:
        logger.info("📱 SMS placeholder for %s", phone)
        results["sms"] = "pending"

    return results
# ---------------------------
# Health check
# ---------------------------
@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model is not None}