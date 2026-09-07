/**
 * AASRA Model Tunnel Store
 * In-memory global store managing dynamic connections between local model servers and deployed website.
 */

export interface ModelTunnelState {
  url: string | null;
  lastHeartbeat: number;
  models: string[];
  status: "online" | "offline";
  registeredBy?: string;
}

declare global {
  var __aasraModelTunnel: ModelTunnelState | undefined;
}

if (!global.__aasraModelTunnel) {
  global.__aasraModelTunnel = {
    url: null,
    lastHeartbeat: 0,
    models: [
      "Model 1: Climate Stress Early Warning (XGBoost 7-Class)",
      "Model 2: Biological Intervention Readiness Engine",
      "Model 3: Syngenta Product Portfolio Ranker (LambdaMART)",
      "Model 4: Phenology & Growing Degree Days (GDD)",
      "Model 5: Counterfactual Yield Baseline",
      "Model 6: Causal Double ML ROBI (EconML LinearDML)",
    ],
    status: "offline",
  };
}

export function getModelTunnelState(): ModelTunnelState {
  return global.__aasraModelTunnel!;
}

export function getActiveModelTunnelUrl(): string | null {
  const tunnel = global.__aasraModelTunnel;
  if (!tunnel || !tunnel.url) return null;
  // Consider stale after 5 minutes of no heartbeat
  if (Date.now() - tunnel.lastHeartbeat > 300000) {
    tunnel.status = "offline";
    return null;
  }
  return tunnel.url;
}

export function setModelTunnelUrl(url: string, models?: string[]): void {
  const tunnel = global.__aasraModelTunnel!;
  tunnel.url = url.trim().replace(/\/+$/, "");
  tunnel.lastHeartbeat = Date.now();
  tunnel.status = "online";
  if (models && models.length > 0) {
    tunnel.models = models;
  }
}

export function clearModelTunnel(): void {
  const tunnel = global.__aasraModelTunnel!;
  tunnel.url = null;
  tunnel.status = "offline";
  tunnel.lastHeartbeat = 0;
}
