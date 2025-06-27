import { useEffect, useRef } from "react";
import { styledLogs } from "../utils/utils";

function usePeerConnection() {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    // Cleanup the PeerConnection on unmount
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        styledLogs({
          loggerType: "webrtc",
          message: "🛑 PeerConnection closed",
        });
      }
    };
  }, []);

  const initializePeerConnection = () => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      iceTransportPolicy: "all",
    });
    peerConnectionRef.current = peerConnection;

    peerConnectionRef.current = peerConnection;
    styledLogs({ loggerType: "webrtc", message: "✨ PeerConnection created" });
  };

  const createOffer = async () => {
    styledLogs({ loggerType: "webrtc", message: "🕊️ Creating offer" });
    if (!peerConnectionRef.current) {
      styledLogs({
        loggerType: "error",
        message: "🔴 PeerConnection is not initialized",
      });
      return;
    }

    return peerConnectionRef.current
      ?.createOffer()
      .then((offer) => {
        return peerConnectionRef.current
          ?.setLocalDescription(offer)
          .then(() => {
            styledLogs({
              loggerType: "webrtc",
              message: `🟢 Offer created and set as local description`,
            });
            return offer;
          });
      })
      .catch((error) => {
        console.error("Error creating offer:", error);
      });
  };

  const createAnswer = async () => {
    console.log("Creating answer...");
    if (!peerConnectionRef.current) {
      console.error("PeerConnection is not initialized");
      return;
    }

    if (peerConnectionRef.current.localDescription) {
      console.log("Answer already created. Skipping duplicate call.");
      return peerConnectionRef.current.localDescription;
    }

    return peerConnectionRef.current
      ?.createAnswer()
      .then((answer) => {
        peerConnectionRef.current?.setLocalDescription(answer).then(() => {
          console.log("Answer created and set as local description:", answer);
        });
        return answer;
      })
      .catch((error) => {
        console.error("Error creating answer:", error);
      });
  };

  const setRemoteDescription = async (remoteDescription) => {
    if (!peerConnectionRef.current) {
      console.error("PeerConnection is not initialized");
      return;
    }

    if (
      peerConnectionRef.current.remoteDescription &&
      peerConnectionRef.current.remoteDescription.sdp === remoteDescription.sdp
    ) {
      console.log("Remote description already set. Skipping duplicate call.");
      return;
    }

    return peerConnectionRef.current
      .setRemoteDescription(remoteDescription)
      .then(() => {
        console.log("Remote description set successfully:", remoteDescription);
        return remoteDescription;
      })
      .catch((error) => {
        console.error("Error setting remote description:", error);
      });
  };

  return {
    initializePeerConnection,
    createOffer,
    createAnswer,
    setRemoteDescription,
    peerConnectionRef,
  };
}

export default usePeerConnection;
