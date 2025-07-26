import { useReducer, useEffect, useRef } from "react"

import { io } from "socket.io-client";

import usePeerConnection from "./hooks/usePeerConnection";

import EnteredRoom from './pages/EnteredRoom/EnteredRoom';
import GameEnder from './pages/GameEnder/GameEnder';
import GameStarted from './pages/GameStarted/GameStarted';
import Login from './pages/Login/Login';
import PeerDisconnected from './pages/PeerDisconnected/PeerDisconnected';
import WaitingForPeerToPeerConnection from './pages/WaitingForPeerToPeerConnection/WaitingForPeerToPeerConnection';
import { Button } from "@mui/material";
import { useNotification } from "./contexts/NotificationContext";
import { styledLogs } from "./utils/utils";

// import styles from './App.module.css';

enum APPSTAGE {
  LOGIN = 'LOGIN',
  ENTERED_ROOM = 'ENTERED_ROOM',
  WAITING_FOR_PEER_TO_PEER_CONNECTION = 'WAITING_FOR_PEER_TO_PEER_CONNECTION',
  GAME_STARTED = 'GAME_STARTED',
  PEER_DISCONNECTED = 'PEER_DISCONNECTED',
  GAME_ENDER = 'GAME_ENDER'
}

type ACTIONTYPES = {
  [K in keyof STATE]: { type: K; payload: STATE[K] }
}[keyof STATE];

interface STATE {
  appStage: APPSTAGE,
  userName: string,
  roomID: string,
};

const initialState: STATE = {
  appStage: APPSTAGE.LOGIN,
  userName: '',
  roomID: '',
}

const socket = io('http://localhost:3000')

function App() {
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const { notify } = useNotification();
  const {
    initializePeerConnection,
    createOffer,
    createAnswer,
    setRemoteDescription,
    peerConnectionRef
  } = usePeerConnection();

  const reducer = (state: STATE, action: ACTIONTYPES) => {
    return {
      ...state,
      [action.type]: action.payload
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    initializePeerConnection();
  }, [])

  const handleIceCandidateGeneration = (event: RTCPeerConnectionIceEvent) => {
    if (event.candidate) {
      styledLogs({ loggerType: "webrtc", message: `🧊 ICE candidate generated` });
      styledLogs({ loggerType: "socket", message: "⬆️ EMIT ICE CANDIDATE" });
      socket.emit('sendIceCandidate', event.candidate, (response: { success: boolean; message: string }) => {
        if (response.success) {
          styledLogs({ loggerType: "socket", message: "🟢 ICE candidate sent successfully" });
        } else {
          styledLogs({ loggerType: "socket", message: `⚠️ Failed to send ICE candidate: ${response.message}` });
        }
      });
    } else {
      styledLogs({ loggerType: "webrtc", message: "🧊 All ICE candidates have been generated !" });
    }
  }

  useEffect(() => {

    if (peerConnectionRef && peerConnectionRef.current) {
      styledLogs({ loggerType: "webrtc", message: "👂🏻 Event listeners Added on PeerConnection" });
      peerConnectionRef.current.onconnectionstatechange = (event) => {
        styledLogs({ loggerType: "webrtc", message: `🔴 Connection state changed: ${event.currentTarget.connectionState}` });
      }
      peerConnectionRef.current.onicecandidate = (event) => {
        styledLogs({ loggerType: "webrtc", message: "🧊 ICE CANDIDATE RECEIVED ⬇️" });
        handleIceCandidateGeneration(event);
      };
      peerConnectionRef.current.onicegatheringstatechange = (event) => {
        styledLogs({ loggerType: "webrtc", message: `🥶🥶🥶🥶🥶 ICE CANDIDATE GATHERING STATE CHANGE: ${event.currentTarget.iceGatheringState}` });
      }
      peerConnectionRef.current.onicecandidateerror = () => {
        styledLogs({ loggerType: "webrtc", message: "⚠️⚠️⚠️⚠️🧊 ice candidate error" });
      };
      peerConnectionRef.current.ondatachannel = (event) => {
        styledLogs({ loggerType: "webrtc", message: "🟢 Data channel created" });
        dataChannel.current = event.channel;
        setupDataChannelEventListeners();
      }
    }

    return () => {
      if (peerConnectionRef.current) {
        styledLogs({ loggerType: "webrtc", message: "🔴 Removing Peer Connection Event Listeners" });
        peerConnectionRef.current.onicecandidate = null;
        peerConnectionRef.current.ontrack = null;
        peerConnectionRef.current.onconnectionstatechange = null;
        peerConnectionRef.current.ondatachannel = null;
        peerConnectionRef.current.onicecandidateerror = null;
        peerConnectionRef.current.oniceconnectionstatechange = null;
        peerConnectionRef.current.onicegatheringstatechange = null;
        peerConnectionRef.current.onnegotiationneeded = null;
        peerConnectionRef.current.onsignalingstatechange = null;
        peerConnectionRef.current.onaddstream = null;
        peerConnectionRef.current.onremovestream = null;
      }
    }
  }, [peerConnectionRef]);


  const setupDataChannelEventListeners = () => {
    styledLogs({ loggerType: "webrtc", message: "👂🏻 Setting up Data channel event listeners" });
    if (dataChannel.current) {
      dataChannel.current.onopen = () => {
        styledLogs({ loggerType: "webrtc", message: "✔️ Data channel opened" });
        startGame();
      }
      dataChannel.current.onclose = () => {
        styledLogs({ loggerType: "webrtc", message: "⚠️ Data channel closed" });
        closeDataChannel();
      }
      dataChannel.current.onerror = (error) => {
        styledLogs({ loggerType: "webrtc", message: `⚠️ Data channel error: ${error}` });
      };
      dataChannel.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const readableTimestamp = new Date(message.timestamp).toLocaleString();
        console.group('📡 Message Received Over Data Channel');
        console.log(`%cFrom: %c ${message.userName}`, "background: #0d3363; color: white; padding: 4px; border: 1px solid #0053b8;", "background: #0073ff; color: white; padding: 4px; border: 1px solid #0053b8; font-weight: bold;");
        console.log(`%cMessage: %c ${message.message}`, "background: #0d3363; color: white; padding: 4px; border: 1px solid #0053b8;", "background: #0073ff; color: white; padding: 4px; border: 1px solid #0053b8; font-weight: bold;");
        console.log(`%cTime: %c ${readableTimestamp}`, "background: #0d3363; color: white; padding: 4px; border: 1px solid #0053b8;", "background: #0073ff; color: white; padding: 4px; border: 1px solid #0053b8; font-weight: bold;");
        console.groupEnd();
      };
    }
  }

  const closeDataChannel = () => {
    if (dataChannel.current) {
      dataChannel.current.close();
      dataChannel.current = null;
      styledLogs({ loggerType: "webrtc", message: "🔴 Data channel closed" });
    }
  }

  const sendMessageOnDataChannel = (message: string) => {
    if (dataChannel.current && dataChannel.current.readyState === 'open') {
      const messageToSend = {
        userName: state.userName,
        message: message,
        timestamp: new Date().toISOString()
      }
      dataChannel.current.send(JSON.stringify(messageToSend));
      styledLogs({ loggerType: "webrtc", message: `📡 Message sent: "${message}"` });
    } else {
      styledLogs({ loggerType: "webrtc", message: `⚠️ Data channel is not open` });
    }
  };

  const socketConnectHandler = () => {
    styledLogs({ loggerType: "socket", message: "🔗 Connected to the server" });
    notify('Connected to the server', 'success');
  }

  const socketMessageHandler = data => {
    styledLogs({ loggerType: "socket", message: `⬇️ Socket message received: \n "${data}"` });
  };

  const socketRoomStatusHandler = data => {
    console.group('🏠 Room Status:');
    styledLogs({ loggerType: "socket", message: `🏠 Room Status:` });
    console.log(data);
    console.groupEnd();
    notify(`Room Status: ${data}`, 'info');
  };

  const socketTriggerWebRtcOfferHandler = () => {

    styledLogs({ loggerType: "webrtc", message: "🚀 Initiating WebRTC Procedure" });

    dataChannel.current =
      peerConnectionRef?.current?.createDataChannel("dataChannel");
    setupDataChannelEventListeners();

    styledLogs({ loggerType: "webrtc", message: "🚀 Data channel created" });
    createOffer()
      .then((offer) => {
        styledLogs({ loggerType: "socket", message: `⬆️ EMIT OFFER` });
        socket.emit('sendOffer', offer, (response: { success: boolean; message: string }) => {
          if (response.success) {
            styledLogs({ loggerType: "webrtc", message: "✔️ Offer sent successfully" });
          }
        });
      })
      .catch((error) => {
        console.error('Error creating offer:', error);
      }
      );
  }

  const socketOfferHandler = (offer: string) => {
    styledLogs({ loggerType: "socket", message: "🚀 Received offer" });
    setRemoteDescription(offer)
      .then(() => {
        createAnswer()
          .then((answer) => {
            styledLogs({ loggerType: "socket", message: "⬆️ EMIT ANSWER" });
            socket.emit('sendAnswer', answer, (response: { success: boolean; message: string }) => {
              if (response.success) {
                styledLogs({ loggerType: "socket", message: "✔️ Answer sent successfully" });
              }
            });
            dispatch({ type: 'appStage', payload: APPSTAGE.WAITING_FOR_PEER_TO_PEER_CONNECTION });
          }
          )
          .catch((error) => {
            console.error('Error creating answer:', error);
          }
          );
      })
      .catch((error) => {
        console.error("Error setting remote description:", error);
      });
  }

  const socketIceCandidateHandler = (candidate: RTCIceCandidate) => {
    styledLogs({ loggerType: "webrtc", message: "🧊⬇️ Received ICE candidate" });

    peerConnectionRef?.current?.addIceCandidate(candidate)
      .then(() => {
        styledLogs({ loggerType: "webrtc", message: "🟢 Remote ICE candidate added successfully" });
      })
      .catch(error => {
        styledLogs({ loggerType: "webrtc", message: `⚠️ Error adding ICE candidate: ${error}` });
      });
  }

  const startGame = () => {
    dispatch({ type: 'appStage', payload: APPSTAGE.GAME_STARTED });
  }

  const socketAnswerHandler = (answer: string) => {
    styledLogs({ loggerType: "socket", message: "⬇️ Received answer" });
    setRemoteDescription(answer)
      .then(() => {
        styledLogs({ loggerType: "socket", message: "🟢 Answer set successfully" });
        dispatch({ type: 'appStage', payload: APPSTAGE.WAITING_FOR_PEER_TO_PEER_CONNECTION });
      })
      .catch((error) => {
        console.error('Error setting remote SDP:', error);
      });
  }

  useEffect(() => {
    socket.on('connect', socketConnectHandler);

    socket.on('message', socketMessageHandler)

    socket.on('roomsStatus', socketRoomStatusHandler)

    socket.on('triggerWebRtcOffer', socketTriggerWebRtcOfferHandler)

    socket.on("offer", socketOfferHandler);

    socket.on("answer", socketAnswerHandler);

    socket.on('peer_disconnected', () => {
      dispatch({ type: 'appStage', payload: APPSTAGE.PEER_DISCONNECTED });
    });

    socket.on('iceCandidate', socketIceCandidateHandler);

    return () => {
      socket.off('connect', socketConnectHandler);

      socket.off('message', socketMessageHandler)

      socket.off('roomsStatus', socketRoomStatusHandler)

      socket.off('peer_disconnected');
    }
  }, [socket]);

  useEffect(() => {
    switch (state.appStage) {
      case APPSTAGE.LOGIN:
        break;
      case APPSTAGE.ENTERED_ROOM:
        break;
      case APPSTAGE.WAITING_FOR_PEER_TO_PEER_CONNECTION:
        break;
      case APPSTAGE.GAME_STARTED:
        break;
      case APPSTAGE.PEER_DISCONNECTED:
        break;
      case APPSTAGE.GAME_ENDER:
        break;
      default:
        break;
    }

  }, [state.appStage]);

  useEffect(() => {
    if (state.roomID !== '') {
      styledLogs({ loggerType: "socket", message: `🔗 Joining room: ${state.roomID}` });
      socket.emit("join", state.roomID, (response: { success: boolean; message: string }) => {
        if (response.success) {
          dispatch({ type: 'appStage', payload: APPSTAGE.ENTERED_ROOM });
        } else {
          console.error(`Failed to join room: ${response.message}`);
        }
      });
    }
  }, [state.roomID]);

  const loginUser = (userName: string, roomName: string) => {
    dispatch({ type: 'userName', payload: userName });
    socket.emit('login', userName, (response: { success: boolean; message: string }) => {
      if (response.success) {
        styledLogs({ loggerType: "socket", message: "🔑 Login successful" });
        dispatch({ type: 'roomID', payload: roomName });
        notify('Login successful', 'success');
      } else {
        console.error(`Login failed: ${response.message}`);
        notify(`Login failed: ${response.message}`, 'error');
      }
    });
  }

  const getAppScreen = (state: STATE): React.ReactNode => {
    switch (state.appStage) {
      case APPSTAGE.LOGIN:
        return <Login onLogin={loginUser} />;
      case APPSTAGE.ENTERED_ROOM:
        return <EnteredRoom roomName={state.roomID} />;
      case APPSTAGE.WAITING_FOR_PEER_TO_PEER_CONNECTION:
        return <WaitingForPeerToPeerConnection />;
      case APPSTAGE.GAME_STARTED:
        return <GameStarted />;
      case APPSTAGE.PEER_DISCONNECTED:
        return <PeerDisconnected />;
      case APPSTAGE.GAME_ENDER:
        return <GameEnder />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div style={{
        backgroundColor: '#e2e2e2',
        padding: '20px',
        borderRadius: '5px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        margin: '20px 0',
        fontFamily: 'Arial, sans-serif',
      }}>
        {getAppScreen(state)}
      </div>
      <hr style={{ border: '5px solid black', margin: '20px 0' }} />
      <Button
        variant="outlined"
        onClick={() => {
          socket.emit('identifyMyself', (message) => {
            console.log('response is ', message);
          })
        }}
      >Check My Details</Button>
      <Button
        variant="outlined"
        onClick={() => {
          console.log('peer connection ', peerConnectionRef);
        }
        }
      >Check Peer Connection</Button>
      <Button
        variant="outlined"
        onClick={() => {
          sendMessageOnDataChannel('Hello from the data channel!');
          notify('📡📡📡📡📡 Message sent', 'success');
        }}
      >Send message</Button>

      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        textAlign: 'left'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{
              border: '1px solid #ddd',
              padding: '8px',
              fontWeight: 'bold'
            }}>SDP Type</th>
            <th style={{
              border: '1px solid #ddd',
              padding: '8px',
              fontWeight: 'bold'
            }}>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{
              border: '1px solid #ddd',
              padding: '8px'
            }}>Local SDP</td>
            <td style={{
              border: '1px solid #ddd',
              padding: '8px'
            }}>{peerConnectionRef && peerConnectionRef.current && peerConnectionRef.current.currentLocalDescription ? peerConnectionRef.current.currentLocalDescription.type : 'N/A'}</td>
          </tr>
          <tr>
            <td style={{
              border: '1px solid #ddd',
              padding: '8px'
            }}>Remote SDP</td>
            <td style={{
              border: '1px solid #ddd',
              padding: '8px'
            }}>{peerConnectionRef && peerConnectionRef.current && peerConnectionRef.current.currentRemoteDescription ? peerConnectionRef.current.currentRemoteDescription.type : 'N/A'}</td>
          </tr>

        </tbody>
      </table>
    </div>
  )
}

export default App