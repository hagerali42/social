import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
//set directory dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "./config/.env") });
import express from "express";
import initApp from "./src/index.router.js";
import { initIo } from "./src/utils/socketio.js";
// import { authSoket } from "./src/middleware/auth.js";
import cors from "cors";
import userModel from "./DB/model/User.model.js";
const port = process.env.PORT || 5000;
const app = express();
const allowedOrigins = [
  "http://localhost:3000",
  "https://gorgeous-liger-a5c8b5.netlify.app",
];


app.use(
  cors({
    origin: function (origin, callback) {
       console.log("Request Origin:", origin);

      if (!origin) {
        // Requests with no origin (e.g., same-origin requests) are allowed
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) === -1) {
        const message ="The CORS policy for this site does not allow access from the specified origin.";
        return callback(new Error(message), false);
      }

      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Specify the methods you want to allow
    credentials: true,
    optionsSuccessStatus: 204, // Handle preflight requests
  })
);

// setup port and the baseUrl
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
  // socket.on("updateSocketId", async (data) => {
  //   const { _id } = await authSoket(data.token);
  //   await userModel.updateOne({ _id }, { socketId: socket.id });
  //   socket.emit("updateSocketId", "Done");
  //   // send all active users to new user
  //   io.emit("get-users", activeUsers);
  // });
  console.log("connected socket");
  socket.on("setup", async (userData) => {
  // await userModel.findByIdAndUpdate(userData._id, { socketId: socket.id });
    socket.join(userData._id);
    socket.emit("connected");
  });
// to join group chat by chat._id
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

 socket.off("setup", () => {
   console.log("USER DISCONNECTED");
   socket.leave(userData._id);
 });
});




