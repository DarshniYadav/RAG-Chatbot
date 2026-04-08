// lib/api.js
async function parseErrorMessage(res, fallbackMessage) {
  let message = fallbackMessage;

  try {
    const data = await res.json();
    if (typeof data === "string" && data.trim()) {
      message = data;
    } else if (data?.detail) {
      message = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
    } else if (data?.msg) {
      message = data.msg;
    }
  } catch {
    try {
      const text = await res.text();
      if (text?.trim()) message = text;
    } catch {
      // Keep fallback message when body parsing fails.
    }
  }

  return message;
}

export async function loginUser(email, password) {
  const res = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  if (!res.ok) {
    const msg = await parseErrorMessage(res, "Invalid credentials");
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function registerUser(name, email, password) {
  const res = await fetch("/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }), // backend only needs email + password
  });
  if (!res.ok) {
    const msg = await parseErrorMessage(res, "Registration failed");
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function uploadDocument(file, token) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/v1/documents/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    const msg = await parseErrorMessage(res, "Upload failed");
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

export async function sendChatMessage(message, sessionId, token, sourceFile = null, candidateName = null) {
  const res = await fetch("/api/v1/chat/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message,
      conversation_id: sessionId,
      source_file: sourceFile,
      candidate_name: candidateName,
    }),
  });
  return res;
}