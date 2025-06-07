// import React, { useState, useEffect } from "react";

// const ChatBox = ({ socket, partnerId }) => {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");

//   const sendMessage = () => {
//     if (input.trim()) {
//       socket.emit("send-message", { text: input });
//       setMessages((prev) => [...prev, { from: "you", text: input }]);
//       setInput("");
//     }
//   };

//   useEffect(() => {
//     if (!socket) return;

//     const handleReceive = ({ from, text }) => {
//       setMessages((prev) => [...prev, { from, text }]);
//     };

//     socket.on("receive-message", handleReceive);

//     return () => socket.off("receive-message", handleReceive);
//   }, [socket]);

//   return (
//     <div>
//       <h3>Chat</h3>
//       <div style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
//         {messages.map((msg, idx) => (
//           <p key={idx}>
//             <strong>{msg.from}:</strong> {msg.text}
//           </p>
//         ))}
//       </div>
//       <input value={input} onChange={(e) => setInput(e.target.value)} />
//       <button onClick={sendMessage}>Send</button>
//     </div>
//   );
// };

// export default ChatBox;

import React, { useState, useEffect } from "react";

const ChatBox = ({ socket, partnerId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("send-message", { text: input });
      setMessages((prev) => [...prev, { from: "you", text: input }]);
      setInput("");
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleReceive = ({ from, text }) => {
      setMessages((prev) => [...prev, { from, text }]);
    };

    socket.on("receive-message", handleReceive);
    return () => socket.off("receive-message", handleReceive);
  }, [socket]);

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "16px",
        background: "#fff",
      }}
    >
      <h3 style={{ marginBottom: "10px" }}>Chat</h3>
      <div
        style={{
          height: "200px",
          overflowY: "auto",
          border: "1px solid #eee",
          padding: "10px",
          borderRadius: "5px",
          marginBottom: "10px",
          background: "#fafafa",
        }}
      >
        {messages.map((msg, idx) => (
          <p key={idx} style={{ margin: "6px 0" }}>
            <strong
              style={{ color: msg.from === "you" ? "#007bff" : "#28a745" }}
            >
              {msg.from === "you" ? "You" : "Stranger"}:
            </strong>{" "}
            {msg.text}
          </p>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flexGrow: 1,
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
