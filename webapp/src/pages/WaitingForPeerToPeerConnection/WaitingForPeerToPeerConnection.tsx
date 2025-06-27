import CircularProgress from '@mui/material/CircularProgress';

function WaitingForPeerToPeerConnection() {
    return (
        <div>
            <CircularProgress />
            Waiting For Peer 2 Peer Connection Establishment
            <p>Please wait while we establish a connection...</p>
            <p>If the connection takes too long, please refresh the page.</p>
            <p>Thank you for your patience!</p>
        </div>
    );
}

export default WaitingForPeerToPeerConnection;