import { useState, useEffect, useCallback } from 'react'
import { io } from "socket.io-client";
import usePeerConnection from './hooks/usePeerConnection';
import './App.css'
import { debounce } from 'lodash';

const socket = io('http://localhost:3000')

function App() {
  // console.clear();
  const [userName, setUserName] = useState('');
  const [roomID, setRoomID] = useState('');
  const [peersList, setPeersList] = useState();

  const socketConnectHandler = () => {
    console.log('Connected to the server');
  }

  const socketMessageHandler = data => {
    console.log('socket: \n ', data)
  };

  const socketRoomStatusHandler = data => {
    console.log('Room Status:____', data);
  }

  useEffect(() => {
    socket.on('connect', socketConnectHandler);

    socket.on('message', socketMessageHandler)

    socket.on('roomsStatus', socketRoomStatusHandler)

    return () => {
      socket.off('connect', socketConnectHandler);

      socket.off('message', socketMessageHandler)

      socket.off('roomsStatus', socketRoomStatusHandler)
    }

  }, [socket])

  const messageToSocket = () => {
    socket.emit('message', "HELLO FROM CLIENT")
  }

  const joinRoom = (roomID: string) => {
    socket.emit("join", roomID, (response: { success: boolean; message: string }) => {
      console.log('response is ', response);
      if (response.success) {
        console.log(`Successfully joined room: ${roomID}`);
      } else {
        console.error(`Failed to join room: ${response.message}`);
      }
    });
  }




  const {
    initializePeerConnection,
    createOffer,
    createAnswer,
    setRemoteDescription,
    localSDP,
    remoteSDP,
    setRemoteSDP,
  } = usePeerConnection();

  const [offer, setOffer] = useState<any>();
  const [answer, setAnswer] = useState<any>();
  const [remoteDescriptionDUMMY, setRemoteDescriptionDUMMY] = useState<any>();
  const [peerConnection, setPeerConnection] = useState();
  useEffect(() => {
    setPeerConnection(new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    }));
  }, [])

  const onCreateOfferSDP = () => {
    if (peerConnection) {
      peerConnection.createOffer()
        .then(SDP => {
          console.log('Offer SDP created -> ', SDP)
          setOffer(JSON.stringify(SDP));
          peerConnection.setLocalDescription(SDP)
        })
        .catch(err => {
          console.log('Error creating Offer SDP', err);
        })
    }

  }

  const onCreateAnswerSDP = () => {
    if (peerConnection) {
      peerConnection.createAnswer()
        .then(SDP => {
          console.log('Answer SDP created ->', SDP)
          setAnswer(JSON.stringify(SDP))
          peerConnection.setLocalDescription(SDP)
        })
    }
  }

  const setRemoteDescription = (data) => {
    peerConnection.setRemoteDescription(data)
  }

  const handleSetRemoteDescription = debounce((value) => {
    try {
      const parsedValue = JSON.parse(value);
      setRemoteDescription(parsedValue);
      console.log('Remote description set successfully:', parsedValue);
    } catch (error) {
      console.error('Invalid SDP format:', error);
    }
  }, 300);


  return (
    <div>
      Socket.io
      <button onClick={messageToSocket}>Message "HELLO FROM CLIENT" to Socket</button>

      <div>
        Join Room ID:
        <div>
          <input type='text' onChange={e => setRoomID(e.target.value)} />
          <button onClick={() => joinRoom(roomID)}>Join Room</button>
        </div>
        <div style={{ marginTop: '24px', border: 'solid 4px #000', borderRadius: '4px', padding: '24px' }}>
          Current Room ID: {roomID}
        </div>
      </div>

    </div>
  )

  return (
    <div>
      <div style={{ border: 'solid 8px black', padding: '24px', width: '50%', background: '#c8ff30' }}>
        OFFERER
        <div style={{ marginTop: '24px' }}>
          Offer SDP:
          <div style={{ border: 'dotted 3px black', padding: '12px', marginTop: '12px' }}>
            {
              offer
            }
          </div>
        </div>
        <input onKeyUp={(e) => {
          if (e.key === "Enter") {
            console.log('peer connection set remote description done', JSON.parse(e.target.value))
            setRemoteDescription(JSON.parse(e.target.value))
          }
          console.log('event is', e)
        }} placeholder='Enter Answer SDP' />

        <br />
        <button style={{ marginTop: '12px' }} onClick={onCreateOfferSDP}>Create Offer SDP</button>
      </div>
      <div style={{ border: 'solid 8px black', padding: '24px', width: '50%', marginTop: '48px', background: '#ffba30' }}>
        ANSWERER
        <div style={{ marginTop: '24px' }}>
          Answer SDP:
          <div style={{ border: 'dotted 3px black', padding: '12px', marginTop: '12px' }}>
            {
              answer
            }
          </div>
        </div>

        <div>
          <input onKeyUp={(e) => {
            if (e.key === "Enter") {
              console.log('peer connection set remote description done', JSON.parse(e.target.value))
              setRemoteDescription(JSON.parse(e.target.value))
            }
          }} placeholder='Enter Offer SDP' />

          <br />
          <button style={{ marginTop: '12px' }} onClick={onCreateAnswerSDP}>Create answer SDP</button>
          <br />
          <input placeholder='Write Message and Send !' style={{ width: '100%' }} />
        </div>

      </div>
    </div>
  )
}

export default App
