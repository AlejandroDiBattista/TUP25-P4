// Debug script para probar el token en la consola del navegador
// Pega este código en la consola del navegador para debuggear

async function debugToken() {
  const BACK = "http://127.0.0.1:8000";
  const token = localStorage.getItem("tp_token");
  
  console.log("🔍 Debugging token...");
  console.log("Token exists:", !!token);
  console.log("Token length:", token ? token.length : 0);
  console.log("Token preview:", token ? token.substring(0, 50) + "..." : "No token");
  
  if (!token) {
    console.log("❌ No token found. User needs to login.");
    return;
  }
  
  try {
    // Test endpoint que requiere autenticación
    console.log("🔗 Testing GET /carrito...");
    const res = await fetch(`${BACK}/carrito`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    console.log("Response status:", res.status);
    console.log("Response statusText:", res.statusText);
    console.log("Response ok:", res.ok);
    
    if (res.ok) {
      const data = await res.json();
      console.log("✅ Token is valid! Response:", data);
    } else {
      const errorText = await res.text();
      console.log("❌ Token invalid or endpoint error:");
      console.log("Error text:", errorText);
      
      // Intentar decodificar el token manualmente para ver si está bien formado
      try {
        const parts = token.split('.');
        if (parts.length === 2) {
          const payload = atob(parts[0]);
          console.log("Token payload:", payload);
        } else {
          console.log("Token doesn't seem to be base64 encoded properly");
        }
      } catch (e) {
        console.log("Error decoding token:", e);
      }
    }
  } catch (err) {
    console.error("❌ Network error:", err);
  }
}

// Test también el endpoint de login
async function testLogin() {
  const BACK = "http://127.0.0.1:8000";
  const email = prompt("Email para test:");
  const password = prompt("Password para test:");
  
  if (!email || !password) return;
  
  try {
    console.log("🔗 Testing POST /iniciar-sesion...");
    const res = await fetch(`${BACK}/iniciar-sesion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    
    console.log("Login response status:", res.status);
    const text = await res.text();
    console.log("Login response:", text);
    
    if (res.ok) {
      try {
        const data = JSON.parse(text);
        const newToken = data?.access_token ?? data?.token ?? data?.accessToken;
        if (newToken) {
          localStorage.setItem("tp_token", newToken);
          console.log("✅ New token saved:", newToken.substring(0, 50) + "...");
        }
      } catch (e) {
        console.log("Could not parse login response as JSON");
      }
    }
  } catch (err) {
    console.error("Login error:", err);
  }
}

console.log("🚀 Debug functions loaded!");
console.log("Run: debugToken() - to test current token");
console.log("Run: testLogin() - to test login and get new token");