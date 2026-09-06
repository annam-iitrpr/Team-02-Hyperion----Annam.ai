import os
import json
import joblib
import numpy as np
import pandas as pd

class YieldPredictor:
    def __init__(self, model_dir="."):
        model_file = os.path.join(model_dir, "model.joblib")
        self.model = joblib.load(model_file)
        self.features = self.model.feature_names_in_

    def preprocess(self, df):
        data = df.copy()
        data.columns = [c.lower().strip() for c in data.columns]
        
        # Agronomic feature formulas
        data['hydrothermal_stress'] = (
            data['dry_spell_max_consecutive_days'] * data['extreme_heat_days_count']
        ) / np.maximum(1.0, data['rainfall_total_mm'] / 100.0)
        
        data['effective_water_retention'] = (data['soil_clay_pct'] / 100.0) * np.sqrt(np.maximum(0.0, data['rainfall_total_mm']))
        data['heat_shock_penalty'] = np.exp(0.045 * data['extreme_heat_days_count']) - 1.0
        data['drought_resilience'] = data['soil_clay_pct'] / np.maximum(1.0, data['dry_spell_max_consecutive_days'])
        data['gdd_rain_interaction'] = data['gdd_seasonal_total'] * data['rainfall_total_mm'] / 1e6

        # One-hot encoding alignment
        data['crop_clean'] = data['crop'].astype(str).str.lower().str.strip()
        for col in self.features:
            if col.startswith('crop_'):
                target_crop = col.replace('crop_', '')
                data[col] = (data['crop_clean'] == target_crop).astype(int)

        # Reindex ensures exact column order with zero-filling
        return data.reindex(columns=self.features, fill_value=0)

    def predict(self, instances):
        """
        Expects a list of dicts (standard Vertex AI JSON request format).
        Returns a list of predicted yields (Q/ha).
        """
        df = pd.DataFrame(instances)
        X = self.preprocess(df)
        preds = self.model.predict(X)
        return [round(float(p), 2) for p in preds]
