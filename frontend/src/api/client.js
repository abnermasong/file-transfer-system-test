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

export async function getAdminTransfers(page, pageSize, getAccessToken) {
  const token = await getAccessToken();
  const res = await fetch(
    `${API_BASE_URL}/api/admin/transfers?page=${page}&page_size=${pageSize}`,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.detail || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }

  return res.json();
}

export async function deleteTransfer(id, getAccessToken) {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE_URL}/api/admin/transfers/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.detail || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }

  return res.json();
}
