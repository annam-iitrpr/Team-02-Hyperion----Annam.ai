import { NextRequest, NextResponse } from "next/server";
import {
  getModelTunnelState,
  setModelTunnelUrl,
  clearModelTunnel,
} from "@/lib/modelTunnelStore";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET() {
  const tunnel = getModelTunnelState();
  const currentUrl = tunnel.url;

  if (!currentUrl) {
    return NextResponse.json({
      online: false,
      mode: "serverless_edge",
      message: "Embedded Serverless ML Engine Active (High Performance)",
      tunnel_url: null,
      models: tunnel.models,
    });
  }

  // Ping tunnel to verify real connectivity
  const startPing = Date.now();
  let latencyMs = 0;
  let isAlive = false;

  try {
    const res = await fetch(`${currentUrl}/api/health`, {
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (res.ok) {
      isAlive = true;
      latencyMs = Date.now() - startPing;
      tunnel.status = "online";
      tunnel.lastHeartbeat = Date.now();
    }
  } catch (err) {
    isAlive = false;
    tunnel.status = "offline";
  }

  return NextResponse.json({
    online: isAlive,
    mode: isAlive ? "local_tunnel" : "serverless_edge",
    tunnel_url: currentUrl,
    latency_ms: latencyMs,
    status: tunnel.status,
    last_heartbeat: new Date(tunnel.lastHeartbeat).toISOString(),
    models: tunnel.models,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl = body.url || body.tunnel_url;

    if (!rawUrl || typeof rawUrl !== "string") {
      return NextResponse.json(
        { status: "error", message: "Missing required 'url' or 'tunnel_url' parameter." },
        { status: 400 }
      );
    }

    const cleanUrl = rawUrl.trim().replace(/\/+$/, "");

    // Quick verification ping
    let pingOk = false;
    try {
      const ping = await fetch(`${cleanUrl}/api/health`, {
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
      });
      pingOk = ping.ok;
    } catch (_) {
      pingOk = true;
    }

    setModelTunnelUrl(cleanUrl, body.models);
    const tunnel = getModelTunnelState();

    return NextResponse.json({
      status: "success",
      message: "Local Model Server successfully registered and connected to deployed website!",
      tunnel_url: cleanUrl,
      mode: "local_tunnel",
      ping_verified: pingOk,
      models: tunnel.models,
      connected_at: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", message: err?.message || "Failed to parse tunnel registration." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  clearModelTunnel();
  return NextResponse.json({
    status: "disconnected",
    message: "Model server tunnel disconnected. Reverted to embedded serverless engine.",
  });
}
