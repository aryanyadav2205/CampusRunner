const API_BASE_URL = "http://localhost:8000/api";

export async function apiCall(endpoint, method = "GET", body = null, token = null) {
  // If token is not passed, attempt to grab it from local storage
  const activeToken = token || localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (activeToken) {
    headers["Authorization"] = `Bearer ${activeToken}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Check if unauthorized, trigger auto-logout
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Optionally redirect to login in browser
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || "Something went wrong.");
    }
    
    return data;
  } catch (error) {
    console.error("API Call error:", error);
    throw error;
  }
}
