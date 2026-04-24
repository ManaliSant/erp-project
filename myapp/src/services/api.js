const BASE_URL = "http://localhost:8081/api";

export async function get(url) {
  const response = await fetch(`${BASE_URL}${url}`);

  if (!response.ok) {
    throw new Error(`GET ${url} failed with status ${response.status}`);
  }

  return response.json();
}

export async function post(url, data) {
  const response = await fetch(`${BASE_URL}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`POST ${url} failed with status ${response.status}`);
  }

  return response.json();
}

export async function patch(url, data) {
  const response = await fetch(`${BASE_URL}${url}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`PATCH ${url} failed with status ${response.status}`);
  }

  return response.json();
}