// src/util/Spotify.js (PKCE)

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

const scopes = ["playlist-modify-public", "playlist-modify-private"];

let accessToken = "";
let expiresAt = 0;

const storedToken = sessionStorage.getItem("spotify_access_token");
const storedExpiration = sessionStorage.getItem("spotify_expires_at");

if (storedToken && storedExpiration && Date.now() < storedExpiration) {
  accessToken = storedToken;
  expiresAt = storedExpiration;
}

function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function generateRandomString(length = 64) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (v) => charset[v % charset.length]).join("");
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest("SHA-256", data);
}

async function generateCodeChallenge(codeVerifier) {
  const hashed = await sha256(codeVerifier);
  return base64UrlEncode(hashed);
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function clearAuthParamsFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  window.history.replaceState({}, document.title, url.pathname);
}

async function exchangeCodeForToken(code) {
  const codeVerifier = sessionStorage.getItem("spotify_code_verifier");
  if (!codeVerifier) throw new Error("Missing PKCE code_verifier.");

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${txt}`);
  }

  const data = await res.json();

  accessToken = data.access_token;
  expiresAt = Date.now() + data.expires_in * 1000;

  sessionStorage.setItem("spotify_access_token", accessToken);
  sessionStorage.setItem("spotify_expires_at", String(expiresAt));

  clearAuthParamsFromUrl();
  return accessToken;
}

export const Spotify = {
    async savePlaylist(playlistName, trackUris) {
  if (!playlistName || !playlistName.trim()) {
    throw new Error("Playlist name is required.");
  }
  if (!Array.isArray(trackUris) || trackUris.length === 0) {
    throw new Error("No tracks to save.");
  }

  const token = await this.getAccessToken();
  
  // 1) Get current user id
  const meRes = await fetch("https://api.spotify.com/v1/me", {
    headers: { 
        Authorization: `Bearer ${token}` },
  });

  console.log("👤 /me response status:", meRes.status);

  if (!meRes.ok) {
    const txt = await meRes.text();
    console.error("❌ Failed to get user profile:", txt);
    throw new Error(`Failed to fetch user profile: ${meRes.status} ${txt}`);
  }

  const meData = await meRes.json();
  console.log("✅ Logged in as:", meData.display_name, meData.id, meData.email);

  const userId = meData.id;

  // 2) Create playlist
  const createRes = await fetch(
    `https://api.spotify.com/v1/users/${encodeURIComponent(userId)}/playlists`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: playlistName,
        description: "Created with Jammming",
        public: false,
      }),
    }
  );

  console.log("📀 Create playlist status:", createRes.status);

  if (!createRes.ok) {
    const txt = await createRes.text();
    console.error("❌ Playlist creation error:", txt);
    throw new Error(`Failed to create playlist: ${createRes.status} ${txt}`);
  }

  const playlistData = await createRes.json();

  console.log("📀 Playlist created:", playlistData);

  const playlistId = playlist.id;

  // 3) Add tracks to playlist
  const addTracksRes = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        uris: trackUris 
      }),
    }
  );

  if (!addTracksRes.ok) {
    const txt = await addTracksRes.text();
    console.error("❌ Failed to add tracks:", txt);
    throw new Error(`Failed to add tracks: ${addRes.status} ${txt}`);
  }

  console.log("✅ Tracks successfully added");

  return playlistData;
},
    isLoggedIn() {
        return Boolean(accessToken) && Date.now() < expiresAt;
    },
    
    logout() {
    accessToken = "";
    expiresAt = 0;
    sessionStorage.removeItem("spotify_access_token");
    sessionStorage.removeItem("spotify_expires_at");
    sessionStorage.removeItem("spotify_code_verifier");
    sessionStorage.clear();
  },

  async getAccessToken() {
    // Reuse token if still valid
    if (accessToken && Date.now() < expiresAt) return accessToken;

    // If redirected back with ?code=..., exchange it for access token
    const code = getQueryParam("code");
    if (code) {
      return await exchangeCodeForToken(code);
    }

    // Start PKCE flow
    const codeVerifier = generateRandomString(80);
    sessionStorage.setItem("spotify_code_verifier", codeVerifier);

    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const authUrl =
      "https://accounts.spotify.com/authorize" +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes.join(" "))}` +
      `&code_challenge_method=S256` +
      `&code_challenge=${encodeURIComponent(codeChallenge)}`;

    window.location.assign(authUrl);
  },
  async search(term) {
  if (!term || !term.trim()) return [];

  const token = await this.getAccessToken();

  const endpoint =
    "https://api.spotify.com/v1/search" +
    `?type=track&q=${encodeURIComponent(term)}&limit=10`;

  const res = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Spotify search failed: ${res.status} ${txt}`);
  }

  const data = await res.json();

  const items = data?.tracks?.items ?? [];

  return items.map((t) => ({
    id: t.id,
    name: t.name,
    artist: t.artists?.[0]?.name ?? "Unknown Artist",
    album: t.album?.name ?? "Unknown Album",
    uri: t.uri,
  }));
},
};