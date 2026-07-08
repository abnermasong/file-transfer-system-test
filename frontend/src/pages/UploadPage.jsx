import { useEffect, useState } from "react";
import { checkHealth } from "../api/client";

export default function UploadPage() {
    const [status, setStatus] = useState("checking"); // "checking" | "ok" | "error"
    const [detail, setDetail] = useState("");

    useEffect(() => {
        checkHealth()
            .then((res) => {
                setStatus("ok");
                setDetail(`${res.app} (${res.environment})`);
            })
            .catch((err) => {
                setStatus("error");
                setDetail(err.message);
            });
    }, []);

    return (
        <div>
            <h1>File Transfer System</h1>
            <p>Upload form will be implemented in Phase 3.</p>
            <p>
                Backend connectivity:{" "}
                {status === "checking" && "checking..."}
                {status === "ok" && `✅ connected (${detail})`}
                {status === "error" && `❌ failed (${detail})`}
            </p>
        </div>
    );
}
