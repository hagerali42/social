
import messageModel from "../../../../DB/model/Message.model.js";
import { ErrorClass } from "../../../utils/error.Class.js";
import chatModel from './../../../../DB/model/Chat.model.js';
import userModel from './../../../../DB/model/User.model.js';

//send messages
export const sendMessage = async (req, res, next) => {
    const { content ,chatId } = req.body;
  if (!content || !chatId) {
    return next(new ErrorClass("Invalid data passed into request", 404));
  }
  const chat =await chatModel.findById(chatId)
  if (!chat) {
    return next(new ErrorClass("In-vaild chat id", 404));
  }
  let newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };
    let message = await messageModel.create(newMessage);
    message = await message.populate("sender", "userName image");
    message = await message.populate("chat");
    message = await userModel.populate(message, {
      path: "chat.users",
      select: "userName image email",
    });
    await chatModel.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    }, { new: true });
    return res.status(200).json(message)
};

//access chat or create new chat
export const allMessages = async (req, res, next) => {
  const { chatId } = req.params;
   const chat = await chatModel.findById(chatId);
   if (!chat) {
     return next(new ErrorClass("In-vaild chat id", 404));
   }
   const message = await messageModel
     .find({ chat: chatId })
     .populate("sender", "userName image email")
    .populate("chat");
  return res.status(200).json(message);

};


