import jwt from "jsonwebtoken";
import userModel from "../../DB/model/User.model.js";
import { getIo } from "../utils/socketio.js";



export const auth = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization?.startsWith(process.env.BEARER_KEY)) {
            return res.json({ message: "In-valid bearer key" })
        }
        const token = authorization.split(process.env.BEARER_KEY)[1]
        if (!token) {
            return res.json({ message: "In-valid token" })
        }
        const decoded = jwt.verify(token, process.env.TOKEN_SIGNATURE)
        if (!decoded?.id) {
            return res.json({ message: "In-valid token payload" })
        }
        const authUser = await userModel
          .findById(decoded.id)
        if (!authUser) {
            return res.json({ message: "Not register account" })
        }
        req.user = authUser;
        return next()
    } catch (error) {
        return res.json({ message: "Catch error" , err:error?.message })
    }
}
export const authSoket = async(authorization,socketId)=>{
    try {
        if (!authorization?.startsWith(process.env.BEARER_KEY)) {
            getIo().to(socketId).emit('authSocket',"In-valid bearer key")
            return false
        }
        const token = authorization.split(process.env.BEARER_KEY)[1]
        if (!token) {
            getIo().to(socketId).emit('authSocket',"In-valid token")
            return false
        }
        const decoded = jwt.verify(token, process.env.TOKEN_SIGNATURE)
        if (!decoded?.id) {
            getIo().to(socketId).emit('authSocket',"In-valid token payload")
            return false
        }
        const authUser = await userModel.findById(decoded.id)
        if (!authUser) {
            getIo().to(socketId).emit('authSocket',"Not register account")
            return false         
        }
        return authUser;
         
    } catch (error) {
        getIo().to(socketId).emit('authSocket',error)
        return false
    }

}

