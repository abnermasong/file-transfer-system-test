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
