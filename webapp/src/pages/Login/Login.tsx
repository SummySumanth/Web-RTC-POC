import React from 'react';
import TextField from '@mui/material/TextField';
import { useNotification } from '../../contexts/NotificationContext';
import { Button } from '@mui/material';



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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', }}>
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
            <Button onClick={() => handleLogin(username, roomName)}>Login</Button>
        </div>
    )
}

export default Login