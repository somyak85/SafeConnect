// client/src/components/SocketProvider/SkipButton.js
import React from "react";

const SkipButton = ({ onSkip, disabled }) => {
  return (
    <div style={{ textAlign: "center", marginTop: 20 }}>
      <button
        onClick={onSkip}
        disabled={disabled}
        style={{
          padding: "10px 20px",
          backgroundColor: disabled ? "#aaa" : "#dc3545",
          color: "white",
          border: "none",
          borderRadius: 5,
          cursor: disabled ? "not-allowed" : "pointer",
          fontSize: 16,
        }}
      >
        Skip Partner
      </button>
    </div>
  );
};

export default SkipButton;
