// import { Server } from "socket.io"
import { Server } from "socket.io";


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