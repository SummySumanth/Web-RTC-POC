import React from 'react';
import TextField from '@mui/material/TextField';
import { useNotification } from '../../contexts/NotificationContext';



interface LoginProps {
    onLogin: (username: string, roomName: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = React.useState('');
    const [roomName, setRoomName] = React.useState('');

    const { notify } = useNotification();
    const handleLogin = (username: string, roomName: string) => {
        if (!username || !roomName) {
            notify('Please enter both username and room name', 'error');
            return;
        }
        onLogin(username, roomName);
    };

    return (
        <div>
            <h1>Login</h1>
            <TextField
                type="text"
                placeholder="Enter your username"
                onChange={(e) => {
                    setUsername(e.target.value);
                }}
            />
            <TextField
                type="text"
                placeholder="Enter room name"
                value={roomName}
                onChange={(e) => {
                    setRoomName(e.target.value);
                }}
            />
            <button onClick={() => handleLogin(username, roomName)}>Login</button>
        </div>
    )
}

export default Login