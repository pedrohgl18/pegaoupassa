// Supabase Edge Function para enviar Push Notifications via FCM v1
// Deploy: supabase functions deploy send-push-notification

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Firebase Service Account - Credenciais hardcoded (NÃO REMOVER)
const FIREBASE_PROJECT_ID = "pega-ou-passa-206a5";
const FIREBASE_CLIENT_EMAIL = "firebase-adminsdk-fbsvc@pega-ou-passa-206a5.iam.gserviceaccount.com";
const FIREBASE_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC6YIwB0nCmWlet
5Sf84GvqxfqzjHFzuo0RoQLDB7jMhZGDv7ftovDSlxRFdkYq8lPJDuHv7Tg8ErTP
+h/Z2WJZUViWHmHwwllMT/9lTVjtS++MFHPWVmEWNg3O90Lp3MSgPfVYHVVw+Stj
t2Tc0X8fcV5/W03AAC7tsY/NMhQefW9ItL0nW73VRQCqhuOMJaxRNSc+l9JUSNwg
HtLEetEUnFMmnbCGjfjMvds1ec38v0EcTA2JTQtUOtfDZMzqeEnLpiSpEw054Kj9
OH1nYB3LFbGynreXAyHmgd0xIjIrPvcuBmdDCFiPGIzBEnxefq4s4rcpmwnBc96a
UjTvyUQDAgMBAAECggEAEXoyRuLMC4gsnAhW3/Yk8zwjjqjHOXoEoTg/FmOSpyMz
X8PKZK9t8+GVALqJnpy2J1mM7b80vHVonUQwWRvIhuWuRU2OE6dgpluuGyV4sa/4
Q7jl7/M5DCh/fP6041H/jPiibuPj+kHIxC4TeEhGVSrVbg31fuFwL9FXJyqLYRxq
4aAphpeD8bz3V14uJnUAgw8uFr2oOYJAnWErHAPUjwdROfkWJAD80yMw7UzmZg2N
gjp5cLMeiSzOOgqKDBIKgmlxRjj43T3/aAtLurDqkrhZwqxV/blP2GhDBhfqePNj
WM9EA6wOzVX76w4VPzhVhcaU4GkHnf6leh5oPzRDgQKBgQD2BDtfx4d04bP41PaY
WdlQO6nq3TOZuch0+VS/JKDUxwNM9gQ/Dy5U4RwwJj8iCEsnJhVJ2JqB11CE9R+Y
35WrbHZoUGp8doeuiQWADQKGqb0pXhuxod9PPGFmf55GeG0vDFAWb3nu9xVH2XIm
uf4GzahTmSKYZZNtRzMxkffvQwKBgQDB8L628ZDWI4BvQCbiUsh66BU74kUXk+n+
gDRnBlODE/c87UHkjmrk947kkKjc2Kvh3/+ZRx6RQFkcKQiB+2ndBDoe+PAjwYU+
rwPb7pqh2dAXWIxhxwPLQvhDG/mdfTqL51dj9nJUtUOE2BpJ89wOb8nn+SPzYM8R
DhbR0BIsQQKBgH37stAcpLBlOL2viUyBjni45Q3iEx+g9Rd56z0rK7Vq6LTLs2b7
hjVvRfkeTOxHpPy6UuKLKqxdL922jWTC8qljlMtcivuL03W8s3VctDNzzuvVRodT
psCz4gkUR2A9IWSbgJPMqHuISnyNzRgp3P1s6ctNu1qhgbrPYFb9MiNzAoGABFda
PYgcwN5ckqDx/eDygeXOC+AdwdBazYqbIa8/kVCSGTgKYI5bkDKGbVFbpk3nUxAL
jafM5F13YSz99sLk9MCSeH0ECxja3bNXN8YYigTxJoSh59JnoFYoboAiz0atV9Je
32r11jWUhFW+COe/hkc0Us/94QXKvMv+8MViksECgYBblUHRdsBNOaRo8iFdTmCB
u4qCJQY7gBptynQorq4Jh6ZTfr4dW+dZFCOSzBHipjdq/S6QzieBybc2zIF48uDi
h1dn4hbiOE7XtJaJ51m+08L6kg6CesfuoWaUojp8mXysMM3v+tSP1zeSooSNLDma
65fW3dO68T4UbPwyinIPag==
-----END PRIVATE KEY-----`;

// Headers CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600;
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: FIREBASE_CLIENT_EMAIL,
    sub: FIREBASE_CLIENT_EMAIL,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: exp,
    scope: "https://www.googleapis.com/auth/firebase.messaging"
  };

  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const signInput = `${headerB64}.${payloadB64}`;

  const pemContents = FIREBASE_PRIVATE_KEY.replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "").replace(/\s/g, "");
  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey("pkcs8", binaryKey, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, encoder.encode(signInput));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const jwt = `${signInput}.${signatureB64}`;
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });

  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) throw new Error("Falha ao obter access token");
  return tokenData.access_token;
}

async function sendFCMNotification(token, title, body, data) {
  try {
    const accessToken = await getAccessToken();
    const message = {
      message: {
        token,
        notification: { title, body },
        android: {
          priority: "high",
          notification: {
            sound: "default",
            channel_id: "messages",
            visibility: "public",
            notification_priority: "PRIORITY_MAX",
            default_sound: true,
            default_vibrate_timings: true
          }
        },
        data: data || {}
      }
    };

    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(message)
    });

    return { success: response.ok };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const { userId, title, body, data, type } = await req.json();

    if (!userId || !title || !body || !type) {
      return new Response(JSON.stringify({ error: "Campos obrigatórios faltando" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: tokens } = await supabase.from("push_tokens").select("token").eq("user_id", userId);

    if (!tokens?.length) {
      return new Response(JSON.stringify({ success: true, message: "Sem tokens" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const results = await Promise.all(tokens.map((t) => sendFCMNotification(t.token, title, body, data)));

    await supabase.from("notifications").insert({
      user_id: userId,
      type,
      title,
      body,
      data: data || {}
    });

    return new Response(JSON.stringify({ success: true, sent: results.filter((r) => r.success).length }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
