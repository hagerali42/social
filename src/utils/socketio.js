import { Server } from "socket.io"
import cors from 'cors'
// import { Server } from "socket.io/dist/index.js";

// const io = require("socket.io")(8800, {
//     cors: {
//       origin: "http://localhost:3000",
//      methods: ["GET", "POST"],
//     },
//   });


let io 
export const initIo =(server)=>{

    io =new Server(server,{
        cors:"*"
    })
    return io
}

export const getIo=()=>{

    if(!io){
        throw new Error('Io failed')
    }
    return io;
}