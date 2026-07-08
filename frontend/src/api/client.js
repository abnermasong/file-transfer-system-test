const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

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
