// src/components/NSFWMonitor.js
import { useEffect, useRef } from "react";
import * as nsfwjs from "@nsfw-filter/nsfwjs";
//import * as tf from "@tensorflow/tfjs";
//import { toast } from "react-toastify";

const NSFWMonitor = ({ videoRef, onWarning, onBan, interval = 5000 }) => {
  const modelRef = useRef(null);
  const warningCountRef = useRef(0);

  useEffect(() => {
    let intervalId;

    const loadModelAndStart = async () => {
      modelRef.current = await nsfwjs.load();
      intervalId = setInterval(checkFrame, interval);
    };

    const checkFrame = async () => {
      if (!modelRef.current || !videoRef.current) return;

      const video = videoRef.current;
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const predictions = await modelRef.current.classify(canvas);
      console.log("NSFW Predictions:", predictions);
      const nsfwScore =
        predictions.find(
          (p) => p.className === "Porn" || p.className === "Sexy"
        )?.probability || 0;

      if (nsfwScore > 0.85) {
        warningCountRef.current += 1;

        if (warningCountRef.current === 1) {
          onWarning?.();
        } else if (warningCountRef.current >= 2) {
          onBan?.();
        }
        // if (warningCountRef.current === 1) {
        //   toast.warn(
        //     "⚠️ Inappropriate content detected. Please keep it clean."
        //   );
        // } else if (warningCountRef.current >= 2) {
        //   toast.error(
        //     "🚫 You’ve been disconnected due to repeated violations."
        //   );
        //   onBan?.(); // still call onBan to handle disconnect
        // }
      }
    };

    loadModelAndStart();

    return () => clearInterval(intervalId);
  }, [videoRef, onWarning, onBan, interval]);

  return null; // No UI, just monitoring
};

export default NSFWMonitor;
