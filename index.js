import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
//set directory dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "./config/.env") });
import express from "express";
import initApp from "./src/index.router.js";
import { initIo } from "./src/utils/socketio.js";
import { authSoket } from "./src/middleware/auth.js";
import cors from "cors";
import userModel from "./DB/model/User.model.js";
const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://localhost:3000",
  "http://localhost:3001",
  "https://localhost:3001",
  "https://social-qftn.onrender.com",
  "*"
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Specify the methods you want to allow
    credentials: true,
    optionsSuccessStatus: 204, // Handle preflight requests
  })
);
// setup port and the baseUrl
const port = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.json({ message: "welcome " });
});

initApp(app, express);

let activeUsers = [];
// //sociect io
const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

const io = initIo(server);
io.on("connection", (socket) => {
  //save socket id      // add new User
  socket.on("updateSocketId", async (data) => {
    const { _id } = await authSoket(data.token);
    await userModel.updateOne({ _id }, { socketId: socket.id });
    if (!activeUsers[data._id]) {
      console.log("new connection", data);
      activeUsers[data._id] = { ...data };
    } else {
      console.log("old connection");
      delete activeUsers[_id];
    }
    socket.emit("updateSocketId", "Done");
    // send all active users to new user
    io.emit("get-users", activeUsers);
  });


  socket.on("disconnect", () => {
    console.log("A user disconnected");
    delete activeUsers[socket.id];
    io.emit("get-users", activeUsers);
  });
  // send message to a specific user
  socket.on("send-message", (data) => {
    console.log('data',data,'socket')
    let receiverID = null;
    if(!receiverID){
      console.log('no reciver');
      return false
    }
    console.log('reciever',receiverID,"sender",data['user_id'])
    if(data["type"] == 'text'){
      io.to(receiverID).emit("getMessage", data);
      }else{
        io.to(receiverID).emit("getMessageImage", data);

    }

  })


});

// io.on("connection", (socket) => {
//   // add new User
//   socket.on("new-user-add", (newUserId) => {
//     // if user is not added previously
//     if (!activeUsers.some((user) => user.userId === newUserId)) {
//       activeUsers.push({ userId: newUserId, socketId: socket.id });
//       console.log("New User Connected", activeUsers);
//     }
//     // send all active users to new user
//     io.emit("get-users", activeUsers);
//   });

//   socket.on("disconnect", () => {
//     // remove user from active users
//     activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
//     console.log("User Disconnected", activeUsers);
//     // send all active users to all users
//     io.emit("get-users", activeUsers);
//   });

//   // send message to a specific user
//   socket.on("send-message", (data) => {
//     const { receiverId } = data;
//     const user = activeUsers.find((user) => user.userId === receiverId);
//     console.log("Sending from socket to :", receiverId);
//     console.log("Data: ", data);
//     if (user) {
//       io.to(user.socketId).emit("recieve-message", data);
//     }
//   });
// });
