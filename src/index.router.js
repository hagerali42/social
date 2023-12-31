import connectDB from '../DB/connection.js'
import authRouter from './modules/auth/auth.router.js'
import userRouter from './modules/user/user.router.js'
import postRouter from './modules/post/post.router.js'
import commentRouter from './modules/comment/comment.router.js'
import ReplaycommentRouter from './modules/ReplayComment/replay.router.js'
import chatRouter from './modules/chat/chat.router.js'
import messageRouter from "./modules/message/message.router.js";

import { globalErrorHandling, notFound } from './utils/errorHandling.js'



const initApp = (app, express) => {
    //convert Buffer Data
    app.use(express.json({}))
    //Setup API Routing 
    app.use(`/auth`, authRouter)
    app.use(`/user`, userRouter)
    app.use(`/post`, postRouter)
    app.use(`/comment`, commentRouter)
    app.use(`/ReplayComment`, ReplaycommentRouter)
    app.use(`/chat`, chatRouter)
    app.use(`/message`, messageRouter);
    
    app.use('*', (req, res, next) => {
        res.send("In-valid Routing Please check url  or  method")
    })
    app.use(globalErrorHandling)
    app.use(notFound)
    connectDB()

}



export default initApp