import { StatusCodes } from "http-status-codes";
import postsModel from "../../../../DB/model/Posts.model.js";
import userModel from "../../../../DB/model/User.model.js";
import { ErrorClass } from "../../../utils/error.Class.js";
import commentModel from "../../../../DB/model/Comment.model.js";
import { getIo } from "../../../utils/socketio.js";

// - Add comment ( can’t add comment on post has isDeleted equal true , user that has isDeleted equal true can’t add comment )
export const AddComment = async (req, res, next) => {
  const { commentBody, postId } = req.body;
  const userId = req.user._id;
  //  post has isDeleted equal true
  const post = await postsModel.findById(postId);
  if (!post || post.isDeleted) {
    return next(
      new ErrorClass(
        "Cannot add comment to a deleted post",
        StatusCodes.NOT_FOUND
      )
    );
  }
  // Check user that has isDeleted equal true
  const user = await userModel.findById(userId);
  if (!user || user.isDeleted) {
    return next(
      new ErrorClass(
        "Cannot add comment as a deleted user",
        StatusCodes.NOT_FOUND
      )
    );
  }
  const comment = new commentModel({
    commentBody,
    createdBy: userId,
    postId,
  });
  comment.populate("createdBy likes replies");
  await comment.save();
  getIo().emit("new comment", comment);
  return res.status(StatusCodes.OK).json({ message: "Done", comment });
};
export const getComment = async (req, res, next) => {
  const { postId } = req.params;
  const comments = await commentModel
    .find({ postId: postId })
    .populate("replies")
    .populate("createdBy")
    .populate("likes")
  return res.status(StatusCodes.OK).json({ message: "Done", comments });
};
// - Update comment ( by comment owner only )
export const updateComment = async (req, res, next) => {
  const { commentBody } = req.body;
  const { commentId } = req.params;
  const userId = req.user._id;
  // Check if the comment exists
  const comment = await commentModel
    .findById(commentId)
    .populate("createdBy replies likes");
  if (!comment) {
    return next( new ErrorClass("Comment not found", StatusCodes.NOT_FOUND));
  }
  // Check if the user is the owner of the comment
  if (comment.createdBy.toString() !== userId) {
    return next( new ErrorClass("You are not authorized to update this comment",StatusCodes.UNAUTHORIZED)
    );
  }
  comment.commentBody = commentBody;
  await comment.save();
    getIo().emit("updateComment", comment);

  return res.status(StatusCodes.OK).json({ message: "Done", comment });
};

// - Delete comment ( by comment owner only )
export const deleteComment = async (req, res, next) => {
  const { commentId } = req.params;
  const userId = req.user._id;
  // Check if the comment exists
  const comment = await commentModel.findById(commentId);
  if (!comment) {
    return next( new ErrorClass("Comment not found", StatusCodes.NOT_FOUND));
  }
  // Check if the user is the owner of the comment
  if (comment.createdBy.toString() !== userId) {
    return next(new ErrorClass("You are not authorized to delete this comment",StatusCodes.UNAUTHORIZED)
    );
  }
  await commentModel.deleteOne({ _id: commentId });
  getIo().emit("deletComment", commentId);

  return res
    .status(StatusCodes.OK)
    .json({ message:"comment deleted ", commentId });
};

// - like comment (user can like the comment only one time )
export const LikeComment = async (req, res, next) => {
  const { commentId } = req.params;
  // Check if the comment exists
  const comment = await commentModel
    .findById(commentId)
    .populate("replies")
    .populate("createdBy")
    .populate("likes");
  if (!comment) {
    return next( new ErrorClass("Comment not found", StatusCodes.NOT_FOUND));
  }
  // Check if the user has already liked the comment
  if (comment.likes.includes(req.user._id)) {
    return next(new ErrorClass("You have already liked this comment", StatusCodes.BAD_REQUEST)
    );
  }
  comment.likes.push(req.user._id);
  await comment.save();
  getIo().emit("likeComment", comment);

  return res
    .status(StatusCodes.OK)
    .json({ message: "Comment liked Done", comment });
};

// - Unlike comment
export const UnlikeComment = async (req, res, next) => {
  const { commentId } = req.params;
  const userId = req.user._id;
  // Check if the comment exists
  const comment = await commentModel
    .findById(commentId)
    .populate("replies")
    .populate("createdBy")
    .populate("likes");
  if (!comment) {
    return next( new ErrorClass("Comment not found", StatusCodes.NOT_FOUND));
  }

  // Check if the user has already liked the comment
  if (!comment.likes.includes(userId)) {
    return next(
      new  ErrorClass(
        "You haven't liked this comment, so you can't unlike it.",
        StatusCodes.BAD_REQUEST
      )
    );
  }
  // Remove the user's id from the likes array
  comment.likes = comment.likes.filter(
    (likeUser) => likeUser.toString() !== userId.toString()
  );
  await comment.save();
  getIo().emit("unlikeComment", comment);

  return res
    .status(StatusCodes.OK)
    .json({ message: "Comment unliked successfully", comment });
};

