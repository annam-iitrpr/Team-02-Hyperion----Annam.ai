"""
AASRA Model 2: Biological Readiness Engine (PS-02 Action Gate)
Combines CalibratedClassifierCV posterior probabilities with strict agronomic safety gating.
"""

import sys
from typing import Dict, Any, List
import pandas as pd
import numpy as np

MODEL2_FEATURES = [
    "soil_moisture_pct",
    "delta_t_celsius",
    "wind_speed_kmh",
    "rain_prob_next_48h",
    "crop_stage_sensitivity"
]

class BiologicalReadinessEngine:
    """
    Production inference wrapper for AASRA Model 2.
    Evaluates calibrated probabilities alongside hard biophysical safety gates.
    """
    def __init__(self, calibrated_model):
        self.model = calibrated_model
        self.feature_names = MODEL2_FEATURES

    def predict_readiness(self, X_df: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Evaluates biological readiness for an input DataFrame of microclimate features.
        Returns:
            list of dicts containing:
            - readiness_score (float, 0.0 to 1.0)
            - spray_window_safe (bool)
            - delta_t (float)
            - reasons (list of str)
        """
        X_df = X_df[MODEL2_FEATURES]
        raw_probs = self.model.predict_proba(X_df)[:, 1]
        results = []

        for i, (_, row) in enumerate(X_df.iterrows()):
            prob = float(raw_probs[i])
            sm = float(row["soil_moisture_pct"])
            dt = float(row["delta_t_celsius"])
            ws = float(row["wind_speed_kmh"])
            rp = float(row["rain_prob_next_48h"])

            reasons = []
            is_safe = True

            # Hard Biophysical Gate Overrides (Section 1 & 2 of AASRA Master Guide)
            if ws > 15.0:
                prob = min(prob, 0.04)
                is_safe = False
                reasons.append(f"Wind speed {ws:.1f} km/h > 15 km/h threshold (severe spray drift hazard)")
            if dt > 8.0:
                prob = min(prob, 0.03)
                is_safe = False
                reasons.append(f"Delta-T {dt:.1f}°C > 8.0°C (rapid droplet evaporation before stomatal uptake)")
            if dt < 2.0:
                prob = min(prob, 0.08)
                is_safe = False
                reasons.append(f"Delta-T {dt:.1f}°C < 2.0°C (high humidity, prolonged leaf wetness & runoff)")
            if rp > 40.0:
                prob = min(prob, 0.05)
                is_safe = False
                reasons.append(f"Rain probability {rp:.1f}% > 40% (risk of active ingredient wash-off)")
            if sm < 30.0:
                prob = min(prob, 0.10)
                is_safe = False
                reasons.append(f"Soil moisture {sm:.1f}% < 30% (root xylem shut down, stomata closed)")

            if is_safe and prob >= 0.50:
                reasons.append("Optimal stomatal aperture and atmospheric conditions for foliar uptake")

            results.append({
                "readiness_score": round(prob, 4),
                "spray_window_safe": bool(is_safe and (prob >= 0.50)),
                "delta_t": round(dt, 2),
                "reasons": reasons
            })

        return results

# Register in sys.modules['__main__'] to ensure backwards compatibility with serialized joblib pickles
if "__main__" in sys.modules and not hasattr(sys.modules["__main__"], "BiologicalReadinessEngine"):
    setattr(sys.modules["__main__"], "BiologicalReadinessEngine", BiologicalReadinessEngine)
