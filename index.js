import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
//set directory dirname 
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, './config/.env') })
import express from 'express'
import initApp from './src/index.router.js'
import { initIo } from './src/utils/socketio.js'
import { authSoket } from './src/middleware/auth.js'
import cors from 'cors'
import userModel from './DB/model/User.model.js'
const app = express()
app.use(cors())

// setup port and the baseUrl
const port = process.env.PORT || 5000
app.get('/', (req, res) =>{
  res.json({message:'welcome '})
})

initApp(app ,express)



// //sociect io
const server =app.listen(port, () => console.log(`Example app listening on port ${port}!`))
const io = initIo(server)
io.on("connection", (socket) => {
    console.log(socket.id+'a user connected');
     //save socket id
    socket.on("updateSocketId", async(data) => {
      const {_id} =await authSoket(data.token)
      await userModel.updateOne({_id},{socketId:socket.id})
      socket.emit("updateSocketId","Done")
    });


    socket.on("disconnect", () => {
      console.log("USER DISCONNECTED");
    });
  });
