import React, { useEffect, useRef, useState } from "react";
import NSFWMonitor from "./NSFWMonitor";
const VideoCall = ({ socket, partnerId }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const [error, setError] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const servers = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };

    peerConnectionRef.current = new RTCPeerConnection(servers);

    peerConnectionRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: partnerId,
          candidate: event.candidate,
        });
      }
    };

    // Get media stream, then setup peer connection tracks and signaling
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(async (stream) => {
        if (!isMounted) return;

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Add tracks to peer connection (both caller and callee)
        stream.getTracks().forEach((track) => {
          peerConnectionRef.current.addTrack(track, stream);
        });

        if (socket.id < partnerId) {
          // Caller: create and send offer
          const offer = await peerConnectionRef.current.createOffer();
          await peerConnectionRef.current.setLocalDescription(offer);
          socket.emit("video-offer", {
            to: partnerId,
            offer: peerConnectionRef.current.localDescription,
          });
        }
      })
      .catch((err) => {
        console.error("Error accessing media devices:", err);
        setError("Unable to access camera/microphone.");
      });

    // Receive offer
    const handleVideoOffer = async ({ from, offer }) => {
      if (!peerConnectionRef.current) return;

      // Set remote description first
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      // Add local tracks *before* creating answer
      if (!localStreamRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          stream.getTracks().forEach((track) => {
            peerConnectionRef.current.addTrack(track, stream);
          });
        } catch (err) {
          console.error("Error accessing media devices:", err);
          setError("Unable to access camera/microphone.");
          return;
        }
      }

      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      socket.emit("video-answer", {
        to: from,
        answer: peerConnectionRef.current.localDescription,
      });
    };

    socket.on("video-offer", handleVideoOffer);

    // Receive answer
    const handleVideoAnswer = async ({ answer }) => {
      if (!peerConnectionRef.current) return;
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    };
    socket.on("video-answer", handleVideoAnswer);

    // Receive ICE candidates
    const handleIceCandidate = async ({ candidate }) => {
      try {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (err) {
        console.error("Error adding received ICE candidate", err);
      }
    };
    socket.on("ice-candidate", handleIceCandidate);

    return () => {
      isMounted = false;
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      socket.off("video-offer", handleVideoOffer);
      socket.off("video-answer", handleVideoAnswer);
      socket.off("ice-candidate", handleIceCandidate);
    };
  }, [socket, partnerId]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "10px",
        maxWidth: "100%",
      }}
    >
      {/* Video Container */}
      <div
        style={{
          display: "flex",
          flexDirection: window.innerWidth < 768 ? "column" : "row",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {/* Local Video */}
        <div style={{ flex: 1, position: "relative" }}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "8px",
              backgroundColor: "#000",
              aspectRatio: "16 / 9",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            You
          </div>

          {/* Control Buttons */}
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "15px",
              zIndex: 10,
            }}
          >
            {/* Mic */}
            <button
              onClick={() => {
                const track = localStreamRef.current?.getAudioTracks()[0];
                if (track) {
                  track.enabled = !track.enabled;
                  setMicOn(track.enabled);
                }
              }}
              title={micOn ? "Mute" : "Unmute"}
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                backgroundColor: micOn ? "#28a745" : "#dc3545",
                color: "#fff",
                fontSize: "20px",
                border: "none",
                cursor: "pointer",
              }}
            >
              {micOn ? "🎤" : "🔇"}
            </button>

            {/* Camera */}
            <button
              onClick={() => {
                const track = localStreamRef.current?.getVideoTracks()[0];
                if (track) {
                  track.enabled = !track.enabled;
                  setCamOn(track.enabled);
                }
              }}
              title={camOn ? "Turn Off Camera" : "Turn On Camera"}
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                backgroundColor: camOn ? "#28a745" : "#dc3545",
                color: "#fff",
                fontSize: "20px",
                border: "none",
                cursor: "pointer",
              }}
            >
              {camOn ? "📷" : "🚫"}
            </button>
          </div>
        </div>

        {/* Remote Video */}
        <div style={{ flex: 1, position: "relative" }}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "8px",
              backgroundColor: "#000",
              aspectRatio: "16 / 9",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            Stranger
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p style={{ color: "red", textAlign: "center", width: "100%" }}>
          {error}
        </p>
      )}

      <NSFWMonitor
        videoRef={localVideoRef}
        onWarning={() => {
          alert(
            "⚠️ Warning: Inappropriate content detected. Please keep it clean."
          );
        }}
        onBan={() => {
          alert(
            "🚫 You have been disconnected due to repeated inappropriate content."
          );
          socket.disconnect();
          window.location.reload();
        }}
      />
    </div>
  );
};

export default VideoCall;
