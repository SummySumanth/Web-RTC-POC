import { useState, useEffect } from "react";

function usePeerConnection() {
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [localSDP, setLocalSDP] = useState("");
  const [remoteSDP, setRemoteSDP] = useState("");

  useEffect(() => {
    // Cleanup the PeerConnection on unmount
    return () => {
      if (peerConnection) {
        peerConnection.close();
        console.log("PeerConnection closed");
      }
    };
  }, [peerConnection]);

  const initializePeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("New ICE candidate:", event.candidate);
      }
    };

    setPeerConnection(pc);
    console.log("PeerConnection initialized");
  };

  const createOffer = async () => {
    if (!peerConnection) {
      console.error("PeerConnection is not initialized");
      return;
    }

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      setLocalSDP(JSON.stringify(offer));
      console.log("Offer created and set as local description:", offer);
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const createAnswer = async () => {
    if (!peerConnection) {
      console.error("PeerConnection is not initialized");
      return;
    }

    try {
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      setLocalSDP(JSON.stringify(answer));
      console.log("Answer created and set as local description:", answer);
    } catch (error) {
      console.error("Error creating answer:", error);
    }
  };

  const setRemoteDescription = async (sdp: string) => {
    if (!peerConnection) {
      console.error("PeerConnection is not initialized");
      return;
    }

    try {
      const remoteDescription = new RTCSessionDescription(JSON.parse(sdp));
      await peerConnection.setRemoteDescription(remoteDescription);
      console.log("Remote description set successfully:", remoteDescription);
    } catch (error) {
      console.error("Error setting remote description:", error);
    }
  };

  return {
    initializePeerConnection,
    createOffer,
    createAnswer,
    setRemoteDescription,
    localSDP,
    remoteSDP,
    setRemoteSDP,
  };
}

export default usePeerConnection;
