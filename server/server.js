import { Server } from "socket.io";

console.clear();

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const rooms = {};

const startGame = (socket, roomID) => {
  console.log(`Game is starting in room: ${roomID}`);
  socket.to(roomID).emit("startGame", rooms[roomID]);

  rooms[roomID].gameData.status = "playing";
  rooms[roomID].gameData.gameStarted = true;
};

const triggerWebRtcOffer = (roomID) => {
  console.log(`Triggering WebRTC offer in room: ${roomID}`);

  io.to(rooms[roomID][0].id).emit("triggerWebRtcOffer");
};

const joinRoom = (socket, roomID, rooms, callback) => {
  // Check if the room exists
  if (!rooms[roomID]) {
    rooms[roomID] = [];
    console.log(`✨ Room ${roomID} does not exist. Created a new room`);
    rooms[roomID].push({
      id: socket.id,
      userName: socket.userName,
    });
    socket.join(roomID);
    socket.roomID = roomID;
    console.log("UPDATED ROOMS:", rooms);
    console.log(`User ${socket.id} created and joined room: ${roomID}`);
    socket.to(roomID).emit("message", "A new user has joined the room");
    console.log(`Room ${roomID} now has users: ${rooms[roomID]}`);
    callback({
      success: true,
      message: `You have created and joined room "${roomID}", `,
    });
  } else {
    // Room exists
    console.log(`🟢 User ${socket.id} is joining existing room: ${roomID}`);
    // Check if the room is filled up
    if (rooms[roomID].length >= 2) {
      // Room is full
      // Notify the user that the room is full
      // and they cannot join
      callback({
        success: false,
        message: `Room ${roomID} is full. You cannot join.`,
      });
      console.log(`Room ${roomID} is full. User ${socket.id} cannot join.`);
    } else {
      // Room is not full
      // Add the user to the room
      // and notify the other users in the room
      // that a new user has joined
      // and send the user a message that they have joined the room
      socket.join(roomID);
      rooms[roomID].push({
        id: socket.id,
        userName: socket.userName,
      });
      socket.roomID = roomID;
      console.log(`User ${socket.id} joined room: ${roomID}`);
      socket.to(roomID).emit("message", "A new user has joined the room");
      console.log(`Room ${roomID} now has users: ${rooms[roomID]}`);
      callback({
        success: true,
        message: `You have joined room "${roomID}"`,
      });
      // Trigger WebRTC Procedure on the client side of first user

      triggerWebRtcOffer(socket.roomID);
    }
  }
  // Emit a deep copy of rooms to avoid reference issues
  console.log("Emitting rooms status:", rooms);
  socket.emit("roomsStatus", rooms);
};

const getRoomsStatus = () => {
  console.log("Rooms status:", rooms);
};

io.on("connection", (socket) => {
  //   console.log("A user connected", socket.id);

  // Send Greeting message to the client
  socket.emit("message", `Hello from server, your id is ${socket.id}`);

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    // Remove the user from the room
    const roomID = socket.roomID;
    if (roomID) {
      console.log(`User ${socket.id} left room: ${roomID}`);
      rooms[roomID] = rooms[roomID].filter((user) => user.id !== socket.id);
      socket.to(roomID).emit("message", "A user has left the room");
      console.log(`Room ${roomID} now has users: ${rooms[roomID]}`);
    }
    // Remove the room if it is empty
    if (rooms[roomID] && rooms[roomID].length === 0) {
      delete rooms[roomID];
      console.log(`Room ${roomID} is empty and has been deleted`);
    }
    getRoomsStatus();
  });

  socket.on("message", (msg) => {
    console.log("Message received: " + msg);
    socket.emit(
      "messageReceivedAcknowledgment",
      "Hey, I'm Server and I have received your message: " + msg
    );
  });

  socket.on("join", (roomID, callback) => {
    console.log(`User ${socket.id} is trying to join room: ${roomID}`);
    joinRoom(socket, roomID, rooms, callback);
    getRoomsStatus();
  });

  socket.on("login", (userName, callback) => {
    socket.userName = userName;
    console.log(`User ${socket.id} logged in as ${userName}`);
    callback({
      success: true,
      message: `You are logged in as ${userName}`,
    });
    // Emit a deep copy of rooms to avoid reference issues
    console.log("Emitting rooms status:", JSON.stringify(rooms));
    socket.emit("roomsStatus", JSON.stringify(rooms));
  });

  socket.on("sendOffer", (offer, callback) => {
    console.log(`User ${socket.id} is sending offer to room: ${socket.roomID}`);
    socket.offer = offer;
    console.log("Offer:", offer);
    socket.to(socket.roomID).emit("offer", offer);
    callback({
      success: true,
      message: `Offer sent to room ${socket.roomID}`,
    });
  });

  socket.on("sendAnswer", (answer, callback) => {
    console.log(
      `User ${socket.id} is sending answer to room: ${socket.roomID}`
    );
    socket.to(socket.roomID).emit("answer", answer);
    callback({
      success: true,
      message: `Answer sent to room ${socket.roomID}`,
    });
  });

  socket.on("sendIceCandidate", (iceCandidate, callback) => {
    console.log(
      `User ${socket.id} is sending iceCandidate to room: ${socket.roomID}`
    );
    socket.to(socket.roomID).emit("iceCandidate", iceCandidate);
    callback({
      success: true,
      message: `IceCandidate sent to room ${socket.roomID}`,
    });
  });

  socket.on("data_channel_info", (dataChannelLabel, callback) => {
    console.log("datachannel info received: ", dataChannelLabel);
    socket.to(socket.roomID).emit("data_channel_available", dataChannelLabel);
    callback({
      success: true,
      message: `Data channel available emit sent with label ${dataChannelLabel}`,
    });
  });

  socket.on("identifyMyself", (callback) => {
    console.log(`User ${socket.id} is identifying themselves`);
    callback({
      success: true,
      message: `ID-${socket.id} Name-${socket.userName}`,
    });
  });
});

io.listen(3000);

// gameData: {
//   status: "waiting",
//   gameStarted: false,
//   gameData: null,
//   gameID: null,
//   gameType: null,
//   gameStartedAt: null,
//   gameEndedAt: null,
//   gameDuration: null,
//   gameResult: null,
//   gameWinner: null,
//   gameLoser: null,
//   gameScore: null,
//   gameHistory: [],
//   gameHistoryLimit: 10,
// },
