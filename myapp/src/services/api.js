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
  if (response.status === 401) {
    localStorage.removeItem("token");

    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }

    throw new Error(`${method} ${url} unauthorized with status ${response.status}`);
  }

  if (response.status === 403) {
    throw new Error(`${method} ${url} forbidden with status ${response.status}`);
  }

  if (!response.ok) {
    throw new Error(`${method} ${url} failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
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

export async function del(url) {
  const response = await fetch(`${BASE_URL}${url}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse(response, "DELETE", url);
}