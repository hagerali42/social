import chatModel from "../../../../DB/model/Chat.model.js";
import userModel from "../../../../DB/model/User.model.js";
import { ErrorClass } from "../../../utils/error.Class.js";
import { getIo } from "../../../utils/socketio.js";

export const accessChat = async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) {
    return next(new ErrorClass("In-vaild user", 404));
  }
  var isChat = await chatModel
    .find({
      isGroupChat: false, // this chat is one to one
      $and: [
        //to-check user and another user founded
        { users: { $elemMatch: { $eq: req.user._id } } }, //sender
        { users: { $elemMatch: { $eq: userId } } }, //recever
      ],
    })
    .populate("users", "-password")
    .populate("latestMessage");
  //populate data of user(sender) of this chat
  isChat = await userModel.populate(isChat, {
    path: "latestMessage.sender",
    select: "userName image email",
  });
//check if chat isExist
  if (isChat.length > 0) {
    res.send(isChat[0])   //becouse chat is one to one
  } else {
    //create new chat
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
    try {
      const createdChat = await chatModel.create(chatData);
      const FullChat = await chatModel
        .findOne({_id: createdChat._id,})
        .populate("users", "-password");
      return res.status(200).json(FullChat);
    } catch (error) {
      return next(new ErrorClass(`${error.message}`, 400));
    }
  }
};
export const fetchChats = async (req, res) => {
  try {
    chatModel.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await userModel.populate(results, {
          path: "latestMessage.sender",
          select: "userName image email",
        });
       return res.status(200).send(results);
      });
  } catch (error) {
    return next(new ErrorClass(`${error.message}`, 400));
  }
};


