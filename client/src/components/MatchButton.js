// src/components/MatchButton.js
import React, { useEffect, useState } from "react";

function MatchButton() {
  const [partnerId, setPartnerId] = useState(null);

  useEffect(() => {
    if (!window.socket) return;

    window.socket.on("partner-found", ({ partnerId }) => {
      console.log("Matched with:", partnerId);
      setPartnerId(partnerId);
    });

    // Cleanup listener on unmount
    return () => {
      window.socket?.off("partner-found");
    };
  }, []);

  const handleFindPartner = () => {
    if (window.socket) {
      window.socket.emit("find-partner");
    }
  };

  return (
    <div>
      <button onClick={handleFindPartner}>🔍 Find Partner</button>
      {partnerId && (
        <p style={{ marginTop: "10px" }}>
          ✅ Matched with partner ID: <strong>{partnerId}</strong>
        </p>
      )}
    </div>
  );
}

export default MatchButton;
