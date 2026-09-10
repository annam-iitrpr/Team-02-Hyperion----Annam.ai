import json
import time
import httpx
import requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request

session = requests.Session()
adapter = requests.adapters.HTTPAdapter(max_retries=5)
session.mount('https://', adapter)
req = Request(session=session)

creds = service_account.Credentials.from_service_account_file(
    r'F:\Downloads\iitm01-92b2edcd1bd1.json',
    scopes=['https://www.googleapis.com/auth/cloud-platform']
)
creds.refresh(req)
token = creds.token
headers = {'Authorization': f'Bearer {token}'}

print("=== CHECKING ENDPOINTS ===")
endpoints = [
    ('M1', '5273488664255528960'),
    ('M2', '2967645655041835008'),
    ('M3', '5672057231277817856'),
    ('M5', '7489681893386878976'),
    ('M6', '1995290347994873856')
]

for name, ep_id in endpoints:
    url = f'https://asia-south1-aiplatform.googleapis.com/v1/projects/iitm01/locations/asia-south1/endpoints/{ep_id}'
    try:
        r = httpx.get(url, headers=headers, timeout=15)
        data = r.json()
        deployed = data.get('deployedModels', [])
        traffic = data.get('trafficSplit', {})
        print(f"{name} ({ep_id}): deployed={len(deployed)}, traffic={traffic}")
    except Exception as e:
        print(f"{name} check failed: {e}")

print("\n=== CHECKING OPERATIONS ===")
try:
    url = 'https://asia-south1-aiplatform.googleapis.com/v1/projects/iitm01/locations/asia-south1/operations?pageSize=6'
    r = httpx.get(url, headers=headers, timeout=15)
    for op in r.json().get('operations', []):
        name = op.get('name').split('/')[-1]
        done = op.get('done')
        stage = op.get('metadata', {}).get('deploymentStage')
        err = op.get('error')
        print(f"op {name} | done: {done} | stage: {stage} | err: {err}")
except Exception as e:
    print(f"Ops check failed: {e}")
