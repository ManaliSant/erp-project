const BASE_URL = "http://localhost:8081/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function handleResponse(response, method, url) {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
    }

    throw new Error(`${method} ${url} failed with status ${response.status}`);
  }

  return response.json();
}

export async function get(url) {
  const response = await fetch(`${BASE_URL}${url}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response, "GET", url);
}

export async function post(url, data) {
  const response = await fetch(`${BASE_URL}${url}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response, "POST", url);
}

export async function patch(url, data) {
  const response = await fetch(`${BASE_URL}${url}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response, "PATCH", url);
}