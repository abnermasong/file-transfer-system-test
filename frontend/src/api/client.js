import { API_BASE_URL } from "../config";

export async function uploadFile(file, recipientEmail) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("recipient_email", recipientEmail);

  const res = await fetch(`${API_BASE_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.detail || `Upload failed: ${res.status}`);
  }

  return data;
}

export async function getDownloadStatus(downloadToken) {
  const res = await fetch(
    `${API_BASE_URL}/api/download/${downloadToken}/status`,
  );
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.detail || `Status check failed: ${res.status}`);
  }

  return data;
}

export async function requestOtp(downloadToken) {
  const res = await fetch(`${API_BASE_URL}/api/download/${downloadToken}/otp`, {
    method: "POST",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.detail || `Failed to request otp: ${res.status}`);
  }

  return data;
}

export async function verifyOtp(downloadToken, otp) {
  const res = await fetch(
    `${API_BASE_URL}/api/download/${downloadToken}/otp/verify`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp }),
    },
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.detail || `Verification failed: ${res.status}`);
  }

  return data;
}

export async function getFileDownloadUrl(downloadToken) {
  const res = await fetch(`${API_BASE_URL}/api/download/${downloadToken}/file`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.detail || `Failed to get download link: ${res.status}`,
    );
  }

  return data;
}
