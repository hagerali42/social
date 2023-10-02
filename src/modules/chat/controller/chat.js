import chatModel from "../../../../DB/model/Chat.model.js";
import userModel from "../../../../DB/model/User.model.js";
import { ErrorClass } from "../../../utils/error.Class.js";
import { getIo } from "../../../utils/socketio.js";

export const sendMessage = async (req, res, next) => {
  const { message, destId } = req.body;
  const destUser = await userModel.findById(destId);
  if (!destUser) {
    return next(new ErrorClass("In-vaild user", 404));
  }
  const chat = await chatModel.findOne({
    $or: [
        { POne: req.user._id, PTwo: destId },
        { POne: destId, PTwo: req.user._id },
    ],
  }).populate([
    { path: "POne" },
    { path: "PTwo" }
  ])


  if (!chat) {
    const chat =await chatModel.create({
        POne:req.user._id,
        PTwo : destId,
        messages:[{
            from:req.user._id,
            to:destId,
            message
        }]
    })
    getIo().to(destUser.socketId).emit('receiveMessage',message)
    return res.status(201).json({message:"Done",chat})
  }
  chat.messages.push({
    from:req.user._id ,
    to:destId,
    message
  })
  await chat.save()
  getIo().to(destUser.socketId).emit('receiveMessage',message)
  return res.status(200).json({message:"Done",chat})

};

export const getChat= async(req,res,next)=>{
    const {destId}=req.params
    const chat = await chatModel.findOne({
        $or: [
            { POne: req.user._id, PTwo: destId },
            { POne: destId, PTwo: req.user._id },
        ],
      }).populate([
        { path: "POne" },
        { path: "PTwo" }
      ])
    return res.status(200).json({message:"Done",chat})
}
