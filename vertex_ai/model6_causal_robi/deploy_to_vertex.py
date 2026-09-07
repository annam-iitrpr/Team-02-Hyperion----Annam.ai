import os
from google.cloud import aiplatform

# Set your GCP Project Details
PROJECT_ID = os.getenv("GCP_PROJECT_ID", "your-gcp-project-id")
REGION = os.getenv("GCP_REGION", "us-central1")
BUCKET_URI = f"gs://{PROJECT_ID}-aasra-models/model6_causal"

print(f"[-] Initializing Vertex AI SDK for Project: {PROJECT_ID} in {REGION}")
aiplatform.init(project=PROJECT_ID, location=REGION)

# 1. Upload Model to Vertex AI Model Registry
print("[-] Registering Model 6 (Causal DML & ROBI) in Vertex AI Model Registry...")
model = aiplatform.Model.upload(
    display_name="aasra_model6_causal_robi",
    artifact_uri=BUCKET_URI,
    serving_container_image_uri="us-docker.pkg.dev/vertex-ai/prediction/sklearn-cpu.1-3:latest",
    description="AASRA PS-07 Double Machine Learning Causal Attribution & ROBI Estimator (50k Govt Census Records)"
)
print(f"[+] Model Uploaded Successfully: {model.resource_name}")

# 2. Deploy Model to Online Prediction Endpoint
print("[-] Deploying Model to an Online Prediction Endpoint (n1-standard-4)...")
endpoint = model.deploy(
    deployed_model_display_name="aasra_model6_causal_prod",
    machine_type="n1-standard-4",
    min_replica_count=1,
    max_replica_count=2
)
print(f"[+] Deployment Complete! Live Endpoint: {endpoint.resource_name}")
