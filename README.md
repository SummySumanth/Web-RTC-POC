# tic-tac-toe

🎮 Web-based multiplayer Tic Tac Toe built with React, Node.js, and WebRTC. Uses WebRTC Data Channels for real-time peer-to-peer gameplay and an Express + WebSocket server for signaling. A hobby project to explore WebRTC, signaling, and state sync without server-based gameplay.

## ✅ WebRTC + Socket.IO Real-Time Architecture Progress

This project is a Web-based Tic Tac Toe game powered by WebRTC for peer-to-peer communication and Socket.IO for signaling. The goal is to enable real-time, serverless game state sync between players.

---

![WebRTC Signaling](https://img.shields.io/badge/WebRTC-Socket.IO%20Signaling-blue)
![Status](https://img.shields.io/badge/Project%20Status-Work%20in%20Progress-yellow)

---

### 📡 Signaling (Socket.IO)

- [ ] Room-based signaling setup
- [ ] Emit/Receive offer SDP
- [ ] Emit/Receive answer SDP
- [ ] Emit/Receive ICE candidates
- [ ] Prevent self-echo on ICE

### 🔌 WebRTC Peer Connection

- [ ] Create RTCPeerConnection with STUN server
- [ ] Set local & remote SDP descriptions
- [ ] Handle `onicecandidate` event
- [ ] Handle connection state changes

### 📶 Data Channel

- [ ] Create `RTCDataChannel` for game state
- [ ] Send/receive structured JSON messages
- [ ] Handle `.onmessage` and parse data
- [ ] Basic backpressure handling (buffer check)

### 🌐 NAT Traversal

- [ ] Use public STUN server
- [ ] Test across different networks/devices
- [ ] Plan for TURN integration (optional)

### ♻️ Resilience

- [ ] Detect peer disconnects (socket + ICE state)
- [ ] Auto-reconnect after reload/tab crash
- [ ] Restore game state from localStorage or memory

### 🛠️ Dev Tools & Debug

- [ ] Log all signaling steps (SDP, ICE, state)
- [ ] Monitor WebRTC Internals (`chrome://webrtc-internals`)
- [ ] Test multi-tab/multi-device gameplay

### 💥 Bonus Goals

- [ ] Integrate TURN for symmetric NAT support
- [ ] Add media stream (audio/video)
- [ ] Encrypt DataChannel messages manually
- [ ] Measure and log latency/throughput
