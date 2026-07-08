import { API_BASE_URL } from "../config";

/**
 * Confirms React <-> FastAPI connectivity (Phase 0 confirmation point).
 * Resolves to { status, app, environment }
 */
export async function checkHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) {
        throw new Error(`Health check failed: ${res.status}`);
    }
    return res.json();
}
