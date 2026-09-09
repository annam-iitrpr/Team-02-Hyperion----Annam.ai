"""
AASRA Master Google Cloud & Vertex AI Deployment Engine
Uploads models to Google Cloud Storage (GCS) and registers them in Vertex AI Model Registry.
"""

import os
import sys
import json
import time
from typing import Dict, Any, List
import google.auth
from google.auth.transport.requests import Request
import httpx

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

PROJECT_ID = "iitm01"
REGION = "asia-south1"
BUCKET_NAME = "iitm01-aasra-models"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_SPECS = [
    {
        "id": "model1",
        "display_name": "aasra-model1-climate-stress",
        "description": "PS-02 Climate Stress Early Warning Multiclass Classifier (XGBoost)",
        "local_dir": os.path.join(BASE_DIR, "model1_climate_stress"),
        "gcs_subfolder": "model1",
        "container_image_uri": "us-docker.pkg.dev/vertex-ai/prediction/xgboost-cpu.1-6:latest",
    },
    {
        "id": "model2",
        "display_name": "aasra-model2-biological-readiness",
        "description": "PS-02 Biological Intervention Readiness & Stomatal Spray Window Engine (Scikit-Learn)",
        "local_dir": os.path.join(BASE_DIR, "model2_biological_readiness"),
        "gcs_subfolder": "model2",
        "container_image_uri": "us-docker.pkg.dev/vertex-ai/prediction/sklearn-cpu.1-0:latest",
    },
    {
        "id": "model3",
        "display_name": "aasra-model3-product-ranker",
        "description": "PS-03 Syngenta 50 Biological Products LambdaMART Ranker (XGBRanker)",
        "local_dir": os.path.join(BASE_DIR, "model3_product_ranker"),
        "gcs_subfolder": "model3",
        "container_image_uri": "us-docker.pkg.dev/vertex-ai/prediction/xgboost-cpu.1-6:latest",
    },
    {
        "id": "model5",
        "display_name": "aasra-model5-yield-baseline",
        "description": "PS-07 Field Yield Baseline Prediction Regressor (XGBoost)",
        "local_dir": os.path.join(BASE_DIR, "model5_yield_regressor"),
        "gcs_subfolder": "model5",
        "container_image_uri": "us-docker.pkg.dev/vertex-ai/prediction/xgboost-cpu.1-6:latest",
    },
    {
        "id": "model6",
        "display_name": "aasra-model6-causal-robi",
        "description": "PS-07 Double Machine Learning Causal Attribution & ROBI Estimator (Microsoft EconML)",
        "local_dir": os.path.join(BASE_DIR, "model6_causal_robi"),
        "gcs_subfolder": "model6",
        "container_image_uri": "us-docker.pkg.dev/vertex-ai/prediction/sklearn-cpu.1-3:latest",
    },
]

def get_auth_token():
    creds, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
    creds.refresh(Request())
    return creds.token

def upload_directory_to_gcs(token: str, local_dir: str, gcs_prefix: str):
    """Uploads all files in a local directory to Google Cloud Storage."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/octet-stream"
    }
    
    for root, _, files in os.walk(local_dir):
        if "__pycache__" in root:
            continue
        for f in files:
            file_path = os.path.join(root, f)
            rel_path = os.path.relpath(file_path, local_dir).replace("\\", "/")
            object_name = f"{gcs_prefix}/{rel_path}".lstrip("/")
            
            print(f"   -> Uploading {f} ({os.path.getsize(file_path)} bytes) -> gs://{BUCKET_NAME}/{object_name}")
            with open(file_path, "rb") as content_file:
                content_bytes = content_file.read()
            
            upload_url = f"https://storage.googleapis.com/upload/storage/v1/b/{BUCKET_NAME}/o?uploadType=media&name={object_name}"
            with httpx.Client(timeout=60.0) as client:
                res = client.post(upload_url, headers=headers, content=content_bytes)
                if res.status_code not in (200, 201):
                    print(f"      [Warning] Upload failed for {f}: {res.status_code} {res.text[:200]}")
                else:
                    print(f"      ✓ Stored in GCS")

def register_model_in_vertex(token: str, spec: Dict[str, Any]) -> str:
    """Uploads and registers model into Vertex AI Model Registry."""
    print(f"\n[Vertex AI Registry] Registering: {spec['display_name']}...")
    url = f"https://{REGION}-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/{REGION}/models:upload"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    artifact_uri = f"gs://{BUCKET_NAME}/{spec['gcs_subfolder']}/"
    payload = {
        "model": {
            "displayName": spec["display_name"],
            "description": spec["description"],
            "artifactUri": artifact_uri,
            "containerSpec": {
                "imageUri": spec["container_image_uri"]
            }
        }
    }
    
    with httpx.Client(timeout=30.0) as client:
        res = client.post(url, headers=headers, json=payload)
        if res.status_code not in (200, 201):
            print(f"   ✗ Registration call failed: {res.status_code} {res.text[:300]}")
            return None
        
        op_data = res.json()
        op_name = op_data.get("name")
        print(f"   ✓ Asynchronous Upload Operation started: {op_name}")
        return op_name

def wait_for_operation(token: str, op_name: str, max_wait=120) -> str:
    """Polls Vertex AI operation until model upload completes."""
    headers = {"Authorization": f"Bearer {token}"}
    poll_url = f"https://{REGION}-aiplatform.googleapis.com/v1/{op_name}"
    
    start = time.time()
    while time.time() - start < max_wait:
        time.sleep(4)
        with httpx.Client(timeout=15.0) as client:
            res = client.get(poll_url, headers=headers)
            if res.status_code == 200:
                data = res.json()
                if data.get("done"):
                    if "error" in data:
                        print(f"   ✗ Operation finished with error: {data['error']}")
                        return None
                    model_res = data.get("response", {}).get("model")
                    print(f"   ✓ Model successfully uploaded! Resource: {model_res}")
                    return model_res
            print("   ... compiling container image and verifying artifact weights ...")
    print("   [Notice] Operation still running in background on Google Cloud.")
    return None

def main():
    print("=" * 75)
    print("   AASRA MASTER GOOGLE CLOUD VERTEX AI DEPLOYMENT")
    print(f"   Project ID  : {PROJECT_ID}")
    print(f"   GCP Region  : {REGION}")
    print(f"   GCS Bucket  : gs://{BUCKET_NAME}")
    print("=" * 75)
    
    token = get_auth_token()
    print("✓ Google Cloud OAuth Bearer Token validated.\n")
    
    print("[STEP 1/2] Uploading Serialized Model Packages to GCS...")
    for spec in MODEL_SPECS:
        print(f"\nProcessing {spec['display_name']}:")
        upload_directory_to_gcs(token, spec["local_dir"], spec["gcs_subfolder"])
        
    print("\n" + "=" * 75)
    print("[STEP 2/2] Registering Models in Vertex AI Model Registry...")
    registered = {}
    for spec in MODEL_SPECS:
        op = register_model_in_vertex(token, spec)
        if op:
            model_name = wait_for_operation(token, op, max_wait=60)
            registered[spec["id"]] = model_name or op
            
    print("\n" + "=" * 75)
    print("AASRA CLOUD VERTEX AI SUMMARY:")
    for k, v in registered.items():
        print(f" • {k}: {v}")
    print("=" * 75)

if __name__ == "__main__":
    main()
