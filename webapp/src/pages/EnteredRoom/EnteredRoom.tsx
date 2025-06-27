import React from 'react';

function EnteredRoom({ roomName }: { roomName: string }) {
    return (
        <div>
            <h1>Entered Room: {roomName}</h1>
        </div>
    );
}

export default EnteredRoom;