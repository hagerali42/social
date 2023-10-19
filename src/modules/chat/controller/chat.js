import chatModel from "../../../../DB/model/Chat.model.js";
import userModel from "../../../../DB/model/User.model.js";
import { ErrorClass } from "../../../utils/error.Class.js";
import { getIo } from "../../../utils/socketio.js";
//access chat or create new chat
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
//get all of chats of this user
export const fetchChats = async (req, res, next) => {
  try {
    chatModel
      .find({ users: { $elemMatch: { $eq: req.user._id } } })
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
//create group chat
export const createGroupChat = async (req, res, next) => {
  //take a user direct and add current user in this arr
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }
  let users = JSON.parse(req.body.users); //arr of users

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }
  users.push(req.user);                      //add current user
  try {
      const groupChat = await chatModel.create({
        //create group chat
        chatName: req.body.name,
        users: users,
        isGroupChat: true,
        groupAdmin: req.user,
      });
      await userModel.findByIdAndUpdate(req.user._id, { isAdmin :true});
      const fullGroupChat = await chatModel  
        .findOne({ _id: groupChat._id })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
      return res.status(200).json({message:"Done",fullGroupChat});
  } catch (error) {
    return next(new ErrorClass(`${error.message}`, 400));

  }
};  

//rename  group 
export const renameGroup =async (req, res,next) => {
  const { chatId, chatName } = req.body;
  const updatedChat = await chatModel.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
      return next(new ErrorClass("Chat Not Found", 404));
  } else {
    return res.status(200).json({message:"Done",updatedChat});
  }
};

//admin remove user to the group
export const removeFromGroup = async (req, res,next) => {
  const { chatId, userId } = req.body;
  // check if the requester is admin
  const admin = await chatModel.findOne({ groupAdmin: req.user._id });
  if (!admin) {
    return next(new ErrorClass("You are not authorized to make this action", 404));
  }

  const removed = await chatModel.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    return next(new ErrorClass("Chat Not Found", 404));

  } else {
   return res.json({message:"Done",removed});
  }
}
//admin add user to the group
export const addToGroup = async (req, res,next) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin
  const admin = await chatModel.findOne({ groupAdmin: req.user._id });
  if (!admin) {
    return next(
      new ErrorClass("You are not authorized to make this action", 404)
    );
  }
  const added = await chatModel.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
      return next(new ErrorClass("Chat Not Found", 404));
  } else {
     return res.json({message:"Done",added});
  }
}