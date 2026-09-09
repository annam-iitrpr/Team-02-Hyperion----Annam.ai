import crypto from "crypto";
import { GCP_SERVICE_ACCOUNT, FIREBASE_DATABASE_URL } from "./firebaseServiceAccount";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Generates an OAuth2 access token for Firebase using Google Service Account JWT bearer assertion.
 * Zero external dependencies — uses Node.js standard crypto module.
 */
export async function getFirebaseAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // Return cached token if valid for at least 5 more minutes
  if (cachedToken && tokenExpiresAt > now + 300) {
    return cachedToken;
  }

  try {
    const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
    const claim = Buffer.from(
      JSON.stringify({
        iss: GCP_SERVICE_ACCOUNT.client_email,
        scope:
          "https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email",
        aud: GCP_SERVICE_ACCOUNT.token_uri,
        exp: now + 3600,
        iat: now,
      })
    ).toString("base64url");

    const sign = crypto.createSign("RSA-SHA256");
    sign.update(`${header}.${claim}`);
    const signature = sign.sign(GCP_SERVICE_ACCOUNT.private_key, "base64url");
    const jwt = `${header}.${claim}.${signature}`;

    const res = await fetch(GCP_SERVICE_ACCOUNT.token_uri, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${encodeURIComponent(jwt)}`,
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OAuth token failed (HTTP ${res.status}): ${errText}`);
    }

    const data = await res.json();
    cachedToken = data.access_token;
    tokenExpiresAt = now + (data.expires_in || 3600);
    return cachedToken as string;
  } catch (err) {
    console.error("Firebase OAuth Token Error:", err);
    throw err;
  }
}

/**
 * Fetch a JSON document or collection from Firebase Realtime Database
 */
export async function firebaseGet<T = any>(path: string): Promise<T | null> {
  try {
    const token = await getFirebaseAccessToken();
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const url = `${FIREBASE_DATABASE_URL}/${cleanPath}.json`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Firebase GET failed (HTTP ${res.status})`);
    }

    return await res.json();
  } catch (err) {
    console.error(`Firebase GET [${path}] failed:`, err);
    return null;
  }
}

/**
 * Write/Overwrite a JSON document or collection in Firebase Realtime Database
 */
export async function firebasePut<T = any>(path: string, data: any): Promise<T | null> {
  try {
    const token = await getFirebaseAccessToken();
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const url = `${FIREBASE_DATABASE_URL}/${cleanPath}.json`;

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Firebase PUT failed (HTTP ${res.status}): ${await res.text()}`);
    }

    return await res.json();
  } catch (err) {
    console.error(`Firebase PUT [${path}] failed:`, err);
    throw err;
  }
}

/**
 * Partially update a document in Firebase Realtime Database
 */
export async function firebasePatch<T = any>(path: string, updates: any): Promise<T | null> {
  try {
    const token = await getFirebaseAccessToken();
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const url = `${FIREBASE_DATABASE_URL}/${cleanPath}.json`;

    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Firebase PATCH failed (HTTP ${res.status}): ${await res.text()}`);
    }

    return await res.json();
  } catch (err) {
    console.error(`Firebase PATCH [${path}] failed:`, err);
    throw err;
  }
}

/**
 * Delete a document or node in Firebase Realtime Database
 */
export async function firebaseDelete(path: string): Promise<boolean> {
  try {
    const token = await getFirebaseAccessToken();
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const url = `${FIREBASE_DATABASE_URL}/${cleanPath}.json`;

    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return res.ok;
  } catch (err) {
    console.error(`Firebase DELETE [${path}] failed:`, err);
    return false;
  }
}
