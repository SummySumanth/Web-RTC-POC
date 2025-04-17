import { useState, useReducer } from "react"

import { io } from "socket.io-client";

import EnteredRoom from './pages/EnteredRoom/EnteredRoom';
import GameEnder from './pages/GameEnder/GameEnder';
import GameStarted from './pages/GameStarted/GameStarted';
import Login from './pages/Login/Login';
import PeerDisconnected from './pages/PeerDisconnected/PeerDisconnected';
import WaitingForPeer from './pages/WaitingForPeer/WaitingForPeer';

enum APPSTAGE {
  LOGIN = 'LOGIN',
  ENTERED_ROOM = 'ENTERED_ROOM',
  WAITING_FOR_PEER = 'WAITING_FOR_PEER',
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
  localSDP: string,
  remoteSDP: string,
};

const initialState: STATE = {
  appStage: APPSTAGE.LOGIN,
  userName: '',
  localSDP: '',
  remoteSDP: '',
}

const socket = io('http://localhost:3000')

function App() {
  const [appState, setAppState] = useState<APPSTAGE>(APPSTAGE.LOGIN);

  const reducer = (state: STATE, action: ACTIONTYPES) => {
    return {
      ...state,
      [action.type]: action.payload
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  const loginUser = (userName) => {

  }

  const getAppScreen = (state: APPSTAGE): React.ReactNode => {
    switch (state) {
      case APPSTAGE.LOGIN:
        return <Login />;
      case APPSTAGE.ENTERED_ROOM:
        return <EnteredRoom />;
      case APPSTAGE.WAITING_FOR_PEER:
        return <WaitingForPeer />;
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
    <div>App
      <div
        style={{ margin: '48px', padding: '28px', minWidth: '30%', minHeight: '300px', background: '#515151' }}>
        {getAppScreen(state.appStage)}
      </div>
    </div>
  )
}

export default App