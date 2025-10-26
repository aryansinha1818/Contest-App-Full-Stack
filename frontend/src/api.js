export const BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:5050/api";

const jsonHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const post = async (path, data, token) => {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const get = async (path, token) => {
  const res = await fetch(`${BASE}${path}`, {
    headers: jsonHeaders(token),
  });
  return res.json();
};

export const del = async (url, token) => {
  try {
    const res = await fetch(`http://localhost:5050/api${url}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
};
