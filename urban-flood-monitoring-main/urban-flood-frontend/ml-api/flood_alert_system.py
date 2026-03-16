# flood_alert_system.py

import random
import time
from datetime import datetime

class FloodAlertSystem:
    def __init__(self):
        pass

    def categorize_flood_probability(self, prob: float):
        """
        Categorize flood risk based on probability value (0–1)
        """
        if prob < 0.6:
            return "Safe", "green"
        elif prob < 0.7:
            return "Moderate", "yellow"
        elif prob < 0.8:
            return "High", "orange"
        else:
            return "Severe", "red"

    def generate_alert(self, flood_probability: float) -> dict:
        """
        Generates a structured flood alert message and data output
        """
        level, color = self.categorize_flood_probability(flood_probability)
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        if level == "Severe":
            message = f"🚨 {timestamp}: Flood Alert! Probability={flood_probability:.2f}. Immediate action required!"
        elif level == "High":
            message = f"⚠️ {timestamp}: High flood risk! Probability={flood_probability:.2f}. Stay prepared."
        elif level == "Moderate":
            message = f"⚠️ {timestamp}: Moderate flood risk. Stay alert! Probability={flood_probability:.2f}."
        else:
            message = f"✅ {timestamp}: Area safe. Probability={flood_probability:.2f}."

        # Return both message and structured data for GIS integration
        return {
            "timestamp": timestamp,
            "flood_probability": round(flood_probability, 2),
            "alert_level": level,
            "color": color,
            "message": message
        }


if __name__ == "__main__":
    system = FloodAlertSystem()

    print("Starting Flood Alert Simulation...\n")
    for _ in range(10):  # simulate 10 readings
        flood_prob = random.random()
        alert_data = system.generate_alert(flood_prob)
        print(alert_data["message"])
        time.sleep(1)