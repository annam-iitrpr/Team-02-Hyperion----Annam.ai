"""
AASRA Model Server — Live Auto-Connect Bridge
Starts the local Python ML inference engine, exposes a secure public HTTPS tunnel,
and automatically registers with the deployed website so all cloud requests run on local models.
"""

import sys
import os
import time
import json
import re
import signal
import subprocess
import threading
import urllib.request
import urllib.error

FASTAPI_PORT = 8000
LOCAL_HEALTH_URL = f"http://127.0.0.1:{FASTAPI_PORT}/api/health"

# Read deployed website target URL from config or CLI
DEFAULT_DEPLOYED_URLS = [
    "http://localhost:3000",
]

def get_target_deployed_url():
    if len(sys.argv) > 1 and sys.argv[1].startswith("http"):
        return sys.argv[1].rstrip("/")
    
    # Check for DEPLOYED_URL.txt in root or backend
    for path in ["DEPLOYED_URL.txt", "../DEPLOYED_URL.txt", "backend/DEPLOYED_URL.txt"]:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    url = f.read().strip()
                    if url.startswith("http"):
                        return url.rstrip("/")
            except Exception:
                pass
    
    # Check environment variable
    if os.environ.get("DEPLOYED_URL"):
        return os.environ.get("DEPLOYED_URL").rstrip("/")
        
    return "http://localhost:3000"


def is_port_in_use(port):
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0


def start_fastapi_server():
    if is_port_in_use(FASTAPI_PORT):
        print(f"[OK] Local FastAPI server is already active on port {FASTAPI_PORT}.")
        return None

    print(f"[...] Starting local FastAPI model server on port {FASTAPI_PORT}...")
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", str(FASTAPI_PORT)]
    
    proc = subprocess.Popen(
        cmd,
        cwd=backend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    
    # Wait for server to become responsive
    for _ in range(15):
        time.sleep(1)
        if is_port_in_use(FASTAPI_PORT):
            print(f"[SUCCESS] FastAPI model server is online at http://127.0.0.1:{FASTAPI_PORT}")
            return proc
            
    print("[WARNING] FastAPI server took longer than expected to start. Continuing...")
    return proc


def register_tunnel_with_deployed_site(deployed_url, tunnel_url):
    endpoint = f"{deployed_url}/api/pipeline/tunnel"
    payload = json.dumps({
        "url": tunnel_url,
        "tunnel_url": tunnel_url,
        "status": "online",
        "models": [
            "Model 1: Climate Stress Early Warning (XGBoost 7-Class)",
            "Model 2: Biological Intervention Readiness Engine",
            "Model 3: Syngenta Portfolio Ranker (LambdaMART 50 Products)",
            "Model 4: Phenology & Degree-Day Engine",
            "Model 5: Counterfactual Yield Baseline",
            "Model 6: Causal Double ML ROBI (EconML LinearDML)"
        ]
    }).encode("utf-8")

    req = urllib.request.Request(
        endpoint,
        data=payload,
        headers={"Content-Type": "application/json", "User-Agent": "AASRA-Model-Bridge/1.0"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode("utf-8"))
            print(f"[SUCCESS] Registered with website: {deployed_url}")
            print(f"          Status: {result.get('status')} | Mode: {result.get('mode')}")
            return True
    except Exception as e:
        print(f"[NOTICE] Could not register with {deployed_url}: {e}")
        return False


def start_tunnel_localtunnel():
    print(f"[...] Launching instant public HTTPS tunnel via npx localtunnel...")
    cmd = ["npx", "--yes", "localtunnel", "--port", str(FASTAPI_PORT)]
    
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        shell=True,
    )

    tunnel_url = None
    start_time = time.time()
    
    while time.time() - start_time < 30:
        line = proc.stdout.readline()
        if not line:
            break
        print(f"    [Tunnel Log] {line.strip()}")
        match = re.search(r"(https://[a-zA-Z0-9\-\.]+\.loca\.lt)", line)
        if match:
            tunnel_url = match.group(1)
            break

    return proc, tunnel_url


def main():
    print("=" * 70)
    print("   AASRA ENTERPRISE — LIVE MODEL SERVER & DEPLOYMENT BRIDGE   ")
    print("=" * 70)
    
    deployed_url = get_target_deployed_url()
    print(f"Target Deployed Website: {deployed_url}")
    print("Connecting local models (XGBoost, LightGBM, EconML Double ML Causal)...")
    print("-" * 70)

    # 1. Start or verify local FastAPI server
    fastapi_proc = start_fastapi_server()

    # 2. Start tunnel
    tunnel_proc, tunnel_url = start_tunnel_localtunnel()

    if not tunnel_url:
        print("[WARNING] Could not obtain external tunnel URL immediately.")
        print(f"Fallback: using direct connection for local testing at http://127.0.0.1:{FASTAPI_PORT}")
        tunnel_url = f"http://127.0.0.1:{FASTAPI_PORT}"

    print("-" * 70)
    print(f"🚀 LIVE MODEL SERVER TUNNEL URL: {tunnel_url}")
    print("-" * 70)

    # 3. Register tunnel with deployed site and local site
    register_tunnel_with_deployed_site(deployed_url, tunnel_url)
    if deployed_url != "http://localhost:3000":
        register_tunnel_with_deployed_site("http://localhost:3000", tunnel_url)

    print("=" * 70)
    print("✅ AASRA MODELS ARE NOW CONNECTED TO THE WEBSITE!")
    print("   All agronomic calculations & ML inference on the website are")
    print("   now executed live on your local machine.")
    print("   Press Ctrl + C at any time to disconnect.")
    print("=" * 70)

    # 4. Keep alive with periodic heartbeats
    try:
        while True:
            time.sleep(30)
            register_tunnel_with_deployed_site(deployed_url, tunnel_url)
    except KeyboardInterrupt:
        print("\n[...] Shutting down model server bridge...")
        try:
            # Deregister
            del_req = urllib.request.Request(
                f"{deployed_url}/api/pipeline/tunnel",
                headers={"User-Agent": "AASRA-Model-Bridge/1.0"},
                method="DELETE"
            )
            urllib.request.urlopen(del_req, timeout=5)
        except Exception:
            pass

        if tunnel_proc:
            tunnel_proc.terminate()
        if fastapi_proc:
            fastapi_proc.terminate()
        print("[DONE] Local model bridge disconnected. Website reverted to edge fallback.")


if __name__ == "__main__":
    main()
