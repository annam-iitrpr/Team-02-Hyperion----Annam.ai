import os
import sys
import json
import joblib
import numpy as np
import pandas as pd

# Compatibility bridge for unpickling scikit-learn GradientBoosting models across versions
try:
    import sklearn._loss._loss
    sys.modules['_loss'] = sklearn._loss._loss
except Exception:
    pass

class AASRACausalPredictor:
    """
    Vertex AI Custom Prediction Routine for AASRA Model 6.
    Computes both factual harvest yield and unbiased Causal Uplift (tau) & ROBI.
    """
    def __init__(self, artifacts_dir):
        self.artifacts_dir = artifacts_dir
        self.dml = joblib.load(os.path.join(artifacts_dir, 'model6_causal_dml.joblib'))
        self.yield_model = joblib.load(os.path.join(artifacts_dir, 'model6_baseline_yield.joblib'))
        with open(os.path.join(artifacts_dir, 'model_metadata.json'), 'r') as f:
            self.metadata = json.load(f)
        self.feature_names_x = self.metadata['feature_schema']['heterogeneity_features_X']
        self.all_crops = self.metadata['supported_crops']

    def preprocess(self, instances):
        df = pd.DataFrame(instances)
        
        # Build X for Causal DML
        x_rows = []
        for _, row in df.iterrows():
            row_dict = {col: 0.0 for col in self.feature_names_x}
            crop = str(row.get('crop', '')).lower()
            stage = str(row.get('growth_stage', '')).lower()
            
            if f'crop_{crop}' in row_dict:
                row_dict[f'crop_{crop}'] = 1.0
            if f'stage_{stage}' in row_dict:
                row_dict[f'stage_{stage}'] = 1.0
                
            row_dict['stress_intensity'] = float(row.get('stress_intensity', 0.5))
            row_dict['temp_max_c'] = float(row.get('temp_max_c', 35.0))
            row_dict['extreme_heat_days_count'] = float(row.get('extreme_heat_days_count', 4.0))
            row_dict['soil_clay_pct'] = float(row.get('soil_clay_pct', 35.0))
            
            x_rows.append([row_dict[col] for col in self.feature_names_x])
            
        return df, np.array(x_rows)

    def predict(self, instances):
        df, X_mat = self.preprocess(instances)
        
        # 1. Compute Causal Effect tau(X) with 95% Confidence Intervals
        tau_raw = np.ravel(self.dml.effect(X_mat))
        tau_bounded = np.maximum(0.0, tau_raw) # Biological protection is non-negative
        tau_lo, tau_hi = self.dml.effect_interval(X_mat, alpha=0.05)
        
        results = []
        for i, row in df.iterrows():
            t = int(row.get('treatment_applied', 1))
            mandi_price = float(row.get('mandi_price_inr_q', 4500.0))
            product_cost = float(row.get('product_cost_inr_acre', 400.0))
            base_yield = float(row.get('baseline_yield_q_acre', 12.0))
            
            tau_val = float(tau_bounded[i])
            ci_lo = float(max(0.0, tau_lo[i][0] if hasattr(tau_lo[i], '__len__') else tau_lo[i]))
            ci_hi = float(max(0.0, tau_hi[i][0] if hasattr(tau_hi[i], '__len__') else tau_hi[i]))
            
            # Factual Harvest Prediction: Y_hat = Y_0 + tau * T
            predicted_yield = round(base_yield + (tau_val * t), 2)
            revenue_protected = int(round(tau_val * mandi_price))
            robi_ratio = round(revenue_protected / max(1.0, product_cost), 1)
            
            results.append({
                "crop": row.get('crop'),
                "treatment_applied": t,
                "predicted_yield_q_acre": predicted_yield,
                "baseline_yield_q_acre": base_yield,
                "causal_gain_tau_q_acre": round(tau_val, 2),
                "confidence_interval_95": [round(ci_lo, 2), round(ci_hi, 2)],
                "revenue_protected_inr_acre": revenue_protected,
                "robi_multiplier": f"{robi_ratio}x" if t == 1 else f"({robi_ratio}x if treated)",
                "methodology": "Microsoft EconML LinearDML (Chernozhukov et al.)"
            })
            
        return {"predictions": results}

# Global entrypoint for Vertex AI Custom Container
predictor = None

def init():
    global predictor
    predictor = AASRACausalPredictor(os.path.dirname(__file__))

def predict_fn(instances):
    global predictor
    if predictor is None:
        init()
    return predictor.predict(instances)
