"""
AASRA Master Deployment Automation: Models 1, 2, 3, and 5 to Google Vertex AI
Direct implementation of Section 3 (Production Infrastructure & Cloud) of AASRA Master ML Playbook.

Lifecycle:
Step 1: Train & tune models in Colab/Local -> Serialized artifacts (.joblib / .json)
Step 2: Initialize Google Cloud Storage (GCS) regional bucket: gs://{PROJECT_ID}-models/
Step 3: Upload serialized model packages to GCS
Step 4: Register all 4 models in Google Vertex AI Model Registry with Google Pre-built Containers
Step 5: Deploy to Vertex AI Online Serving Endpoint (or serve via local high-performance runtime for zero cloud bills)
"""

import os
import sys
import argparse
import subprocess
from typing import Dict, Any

try:
    from google.cloud import aiplatform
    GCP_AVAILABLE = True
except ImportError:
    GCP_AVAILABLE = False

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_REGISTRY_SPECS = {
    "model1": {
        "display_name": "aasra-model1-climate-stress",
        "description": "PS-02 Climate Stress Early Warning Multiclass Classifier (XGBoost)",
        "local_dir": os.path.join(BASE_DIR, "model1_climate_stress"),
        "gcs_subfolder": "model1",
        "serving_container_image_uri": "us-docker.pkg.dev/vertex-ai/prediction/xgboost-cpu.1-6:latest",
    },
    "model2": {
        "display_name": "aasra-model2-biological-readiness",
        "description": "PS-02 Biological Intervention Readiness & Stomatal Spray Window Engine (Scikit-Learn Calibrated)",
        "local_dir": os.path.join(BASE_DIR, "model2_biological_readiness"),
        "gcs_subfolder": "model2",
        "serving_container_image_uri": "us-docker.pkg.dev/vertex-ai/prediction/sklearn-cpu.1-0:latest",
    },
    "model3": {
        "display_name": "aasra-model3-product-ranker",
        "description": "PS-03 Syngenta 50 Biological Products LambdaMART Ranker (XGBRanker)",
        "local_dir": os.path.join(BASE_DIR, "model3_product_ranker"),
        "gcs_subfolder": "model3",
        "serving_container_image_uri": "us-docker.pkg.dev/vertex-ai/prediction/xgboost-cpu.1-6:latest",
    },
    "model5": {
        "display_name": "aasra-model5-yield-baseline",
        "description": "PS-07 Field Yield Baseline Prediction Regressor (XGBoost)",
        "local_dir": os.path.join(BASE_DIR, "model5_yield_regressor"),
        "gcs_subfolder": "model5",
        "serving_container_image_uri": "us-docker.pkg.dev/vertex-ai/prediction/xgboost-cpu.1-6:latest",
    }
}

def check_environment(project_id: str, region: str, bucket_name: str):
    print("=" * 70)
    print("AASRA: VERTEX AI DEPLOYMENT PIPELINE CHECK")
    print(f"Target GCP Project : {project_id}")
    print(f"Target GCP Region  : {region}")
    print(f"Target GCS Bucket  : gs://{bucket_name}")
    print("=" * 70)

def upload_models_to_gcs(bucket_name: str, dry_run: bool = False):
    print("\n[Step 2 & 3] Uploading Model Packages to GCS Bucket...")
    for key, spec in MODEL_REGISTRY_SPECS.items():
        local_dir = spec["local_dir"]
        gcs_dest = f"gs://{bucket_name}/{spec['gcs_subfolder']}/"
        print(f" -> Packaging {spec['display_name']} from {local_dir} -> {gcs_dest}")
        if not dry_run:
            cmd = ["gcloud", "storage", "cp", "-r", f"{local_dir}/*", gcs_dest]
            res = subprocess.run(cmd, capture_output=True, text=True)
            if res.returncode != 0:
                print(f"    Notice: gcloud storage copy returned code {res.returncode}. Output: {res.stderr[:200]}")
            else:
                print("    ✓ Upload complete.")

def register_in_vertex_ai(project_id: str, region: str, bucket_name: str, deploy_endpoints: bool = False):
    if not GCP_AVAILABLE:
        print("\nNotice: google-cloud-aiplatform package not installed in current Python environment.")
        print("Install with: pip install google-cloud-aiplatform")
        print("\nAlternatively, run in Google Cloud Shell or Google Colab using the script below:")
        print_colab_script(project_id, region, bucket_name)
        return

    print("\n[Step 4] Initializing Vertex AI Platform...")
    aiplatform.init(project=project_id, location=region)

    registered_models = {}
    for key, spec in MODEL_REGISTRY_SPECS.items():
        artifact_uri = f"gs://{bucket_name}/{spec['gcs_subfolder']}/"
        print(f"\nRegistering {spec['display_name']} in Vertex AI Model Registry...")
        try:
            v_model = aiplatform.Model.upload(
                display_name=spec["display_name"],
                description=spec["description"],
                artifact_uri=artifact_uri,
                serving_container_image_uri=spec["serving_container_image_uri"]
            )
            registered_models[key] = v_model
            print(f" ✓ Registered successfully! Resource Name: {v_model.resource_name}")

            if deploy_endpoints:
                print(f" [Step 5] Deploying {spec['display_name']} to Online Endpoint...")
                endpoint = v_model.deploy(
                    machine_type="n1-standard-2",
                    min_replica_count=1,
                    max_replica_count=1
                )
                print(f" ✓ Live Endpoint active: {endpoint.resource_name}")
        except Exception as e:
            print(f" ✗ Error registering {spec['display_name']}: {e}")

def print_colab_script(project_id: str, region: str, bucket_name: str):
    print("""
# ----------------------------------------------------
# PASTE IN GOOGLE COLAB / CLOUD SHELL:
# ----------------------------------------------------
from google.cloud import aiplatform

PROJECT_ID = "{project}"
REGION = "{region}"
BUCKET = "gs://{bucket}"

aiplatform.init(project=PROJECT_ID, location=REGION)

MODELS = [
    ("aasra-model1-climate-stress", f"{BUCKET}/model1/", "us-docker.pkg.dev/vertex-ai/prediction/xgboost-cpu.1-6:latest"),
    ("aasra-model2-biological-readiness", f"{BUCKET}/model2/", "us-docker.pkg.dev/vertex-ai/prediction/sklearn-cpu.1-0:latest"),
    ("aasra-model3-product-ranker", f"{BUCKET}/model3/", "us-docker.pkg.dev/vertex-ai/prediction/xgboost-cpu.1-6:latest"),
    ("aasra-model5-yield-baseline", f"{BUCKET}/model5/", "us-docker.pkg.dev/vertex-ai/prediction/xgboost-cpu.1-6:latest"),
]

for name, uri, container in MODELS:
    m = aiplatform.Model.upload(display_name=name, artifact_uri=uri, serving_container_image_uri=container)
    print(f"Registered {name}: {m.resource_name}")
""".format(project=project_id, region=region, bucket=bucket_name))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AASRA Vertex AI Deployment Pipeline")
    parser.add_argument("--project", default="annam-ai-hackathon-2026", help="Google Cloud Project ID")
    parser.add_argument("--region", default="asia-south1", help="Google Cloud Region")
    parser.add_argument("--bucket", default=None, help="GCS Bucket Name (defaults to {project}-models)")
    parser.add_argument("--deploy-endpoints", action="store_true", help="Deploy live n1-standard-2 endpoints")
    parser.add_argument("--dry-run", action="store_true", help="Print plan without running cloud commands")

    args = parser.parse_args()
    bucket = args.bucket or f"{args.project}-models"

    check_environment(args.project, args.region, bucket)
    if args.dry_run:
        print("\n[Dry Run Mode Enabled] Checking local model packages:")
        for k, v in MODEL_REGISTRY_SPECS.items():
            files = os.listdir(v["local_dir"])
            print(f" • {v['display_name']} ({k}): {files}")
        print("\nDeployment plan ready. Run without --dry-run when cloud credentials are authenticated.")
    else:
        upload_models_to_gcs(bucket)
        register_in_vertex_ai(args.project, args.region, bucket, args.deploy_endpoints)
