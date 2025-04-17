import { Server } from "socket.io";

console.clear();

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const rooms = {};

const joinRoom = (socket, roomID, rooms, callback) => {
  // Check if the room exists
  if (!rooms[roomID]) {
    rooms[roomID] = [];
    console.log(`✨ Room ${roomID} does not exist. Created a new room`);
    rooms[roomID].push(socket.id);
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
      rooms[roomID].push(socket.id);
      socket.roomID = roomID;
      console.log(`User ${socket.id} joined room: ${roomID}`);
      socket.to(roomID).emit("message", "A new user has joined the room");
      console.log(`Room ${roomID} now has users: ${rooms[roomID]}`);
      callback({
        success: true,
        message: `You have joined room "${roomID}"`,
      });
    }
  }
  // Emit a deep copy of rooms to avoid reference issues
  console.log("Emitting rooms status:", JSON.parse(JSON.stringify(rooms)));
  socket.emit("roomsStatus", JSON.parse(JSON.stringify(rooms)));
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
      rooms[roomID] = rooms[roomID].filter((id) => id !== socket.id);
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
});

io.listen(3000);
