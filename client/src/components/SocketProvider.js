// client/src/components/SocketProvider/index.js or SocketProvider.js
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import ChatBox from "./ChatBox";
import VideoCall from "./VideoCall";
import SkipButton from "./SkipButton"; // <-- import here

const SOCKET_SERVER_URL =
  process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

const SocketProvider = () => {
  const [socket, setSocket] = useState(null);
  const [partnerId, setPartnerId] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected with socket id:", newSocket.id);
      newSocket.emit("find-partner");
      setIsSearching(true);
    });

    newSocket.on("partner-found", ({ partnerId }) => {
      setStatusMsg(null);
      console.log("Matched with:", partnerId);
      setPartnerId(partnerId);
      setIsSearching(false);
    });

    newSocket.on("partner-disconnected", () => {
      console.log("Partner disconnected. Finding new partner...");
      setPartnerId(null);
      newSocket.emit("find-partner");
      setStatusMsg("Partner disconnected. Searching...");
      setIsSearching(true);
    });

    newSocket.on("partner-skipped", () => {
      console.log("Partner skipped. Finding new partner...");
      setStatusMsg("You were skipped. Finding a new partner...");
      setPartnerId(null);
      newSocket.emit("find-partner");
      setIsSearching(true);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSkip = () => {
    if (socket) {
      socket.emit("skip-partner");
      setIsSearching(true);
      setPartnerId(null);
    }
  };

  if (!socket) return <p>Connecting to server...</p>;

  return (
    <div style={{ maxWidth: 800, width: "100%", marginTop: 30 }}>
      {/* <h2 style={{ textAlign: "center", color: "#007bff" }}>
        Connected as: <span style={{ fontWeight: "normal" }}>{"You"}</span>
      </h2> */}

      {partnerId ? (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <VideoCall socket={socket} partnerId={partnerId} />
            <ChatBox socket={socket} partnerId={partnerId} />
          </div>

          {/* Skip button component */}
          <SkipButton onSkip={handleSkip} disabled={isSearching} />
        </>
      ) : (
        <p style={{ textAlign: "center", marginTop: 30 }}>
          {statusMsg || "Waiting for a partner..."}
        </p>
      )}
    </div>
  );
};

export default SocketProvider;
