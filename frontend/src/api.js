// src/api.js
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

function _headers(token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function login({ id, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, password })
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  return res.json(); // { access_token, token_type }
}

export async function signup(user) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Signup failed: ${txt || res.status}`);
  }
  return res.json();
}

export async function fetchIssues() {
  const res = await fetch(`${API_BASE}/issues/`);
  if (!res.ok) throw new Error('Failed fetching issues');
  return res.json();
}

export async function fetchMyIssues(token) {
  const res = await fetch(`${API_BASE}/issues/my`, {
    method: 'GET',
    headers: _headers(token),
  });
  if (!res.ok) throw new Error('Failed fetching my issues');
  return res.json();
}

// Create issue (multipart: supports file)
export async function createIssue(formData, token) {
  const res = await fetch(`${API_BASE}/issues/`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Create issue failed: ${txt || res.status}`);
  }
  return res.json();
}

export async function voteIssue(issueId, token) {
  const res = await fetch(`${API_BASE}/issues/${issueId}/vote`, {
    method: 'POST',
    headers: _headers(token),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Vote failed: ${txt || res.status}`);
  }
  return res.json();
}

export async function assignIssue(issueId, body, token) {
  const res = await fetch(`${API_BASE}/issues/${issueId}/assign`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Assign failed: ${txt || res.status}`);
  }
  return res.json();
}

export async function updateIssueStatus(issueId, status, token) {
  const res = await fetch(`${API_BASE}/issues/${issueId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Status update failed');
  return res.json();
}

export async function sendFeedback(payload) {
  const res = await fetch(`${API_BASE}/feedback/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Send feedback failed: ${txt || res.status}`);
  }
  return res.json();
}
