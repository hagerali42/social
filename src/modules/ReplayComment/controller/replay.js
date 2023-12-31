
import { StatusCodes } from "http-status-codes";
import commentModel from "../../../../DB/model/Comment.model.js";
import postsModel from "../../../../DB/model/Posts.model.js";
import { ErrorClass } from "../../../utils/error.Class.js";
import userModel from "../../../../DB/model/User.model.js";
import commentReplyModel from "../../../../DB/model/CommentReplay.model.js";
import { getIo } from "../../../utils/socketio.js";

// - replay ( can’t add reply comment on post has isDeleted equal true , user that has isDeleted equal true can’t add replay comment )
export const AddReplayComment = async (req, res, next) => {
  const { replyBody, commentId } = req.body;
  const userId = req.user._id;

  // Check if the comment exists
  const comment = await commentModel.findById(commentId);
  if (!comment) {
    return next(new ErrorClass("Comment not found", StatusCodes.NOT_FOUND));
  }
  // Check if the post associated with the comment has isDeleted equal to true
  const post = await postsModel.findById(comment.postId);
  if (!post || post.isDeleted) {
    return next(
      new ErrorClass(
        "Cannot add reply comment to a deleted post",
        StatusCodes.BAD_REQUEST
      )
    );
  }

  // Check if the user has isDeleted equal to true
  const user = await userModel.findById(userId);
  if (!user || user.isDeleted) {
    return next(
      new ErrorClass(
        "Cannot add reply comment as a deleted user",
        StatusCodes.NOT_FOUND
      )
    );
  }

  // Create and save the reply comment
  const replyComment = new commentReplyModel({
    replyBody,
    createdBy: userId,
    commentId,
    postId: comment.postId,
  });
  replyComment.populate("createdBy likes")
  // Use a database transaction to ensure data consistency
  const session = await commentReplyModel.startSession();
  session.startTransaction();
  try {
    await replyComment.save();
    comment.replies.push(replyComment._id);
    await comment.save();

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    // If any error occurs during the transaction, roll it back
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
  getIo().emit("new Replaycomment", replyComment);
  return res.status(StatusCodes.OK).json({ message: "Done", replyComment });
};

  // - Update updateReplyComment ( by ReplyComment owner only )
export const updateReplyComment=async  (req ,res,next)=>{
  const { replyBody } = req.body;
  const { replyCommentId } = req.params;
  const userId = req.user._id;
  // Check if the replyCommentId exists
  const replayComment = await commentReplyModel.findById(replyCommentId).populate("createdBy likes");
  if (!replyCommentId) {
    return next( new ErrorClass("replyCommentId not found", StatusCodes.NOT_FOUND));
  }
  // Check if the user is the owner of the replyCommentId
  if (replayComment.createdBy._id.toString() !== userId.toString()) {
    return next( new ErrorClass("You are not authorized to update this replayComment",StatusCodes.UNAUTHORIZED));}
    replayComment.replyBody = replyBody;
  await replayComment.save();
    getIo().emit("updateReplyComment", replayComment);
  return res.status(StatusCodes.OK).json({ message: "Done", replayComment });
}

  // - Update deletedReplyComment ( by ReplyComment owner only )
export const deleteReplyComment = async (req, res, next) => {
    const { replyCommentId } = req.params;
    const userId = req.user._id;
    // Check if the ReplyComment exists
    const ReplyComment = await commentReplyModel.findById(replyCommentId);
    if (!ReplyComment) {
      return next( new ErrorClass("ReplyComment not found", StatusCodes.NOT_FOUND));
    }
    // Check if the user is the owner of the ReplyComment
    if (ReplyComment.createdBy._id.toString() !== userId.toString()) {
      return next(
        new ErrorClass(
          "You are not authorized to delete this ReplyComment",
          StatusCodes.UNAUTHORIZED
        )
      );
    }
  await commentReplyModel.deleteOne({ _id: replyCommentId });
      getIo().emit("deleteReplyComment", replyCommentId);

    return res
      .status(StatusCodes.OK)
      .json({ message: " ReplyComment deleted ", replyCommentId });
};

// - like ReplyComment (user can like the ReplyComment only one time )
export const LikeReplyComment = async (req, res, next) => {
  const { replyCommentId } = req.params;
  // Check if the ReplyComment exists
  const ReplyComment = await commentReplyModel.findById(replyCommentId).populate("createdBy");
  if (!ReplyComment) {
    return next( new ErrorClass("ReplyComment not found", StatusCodes.NOT_FOUND));
  }
  // Check if the user has already liked the ReplyComment
  if (ReplyComment.likes.includes(req.user._id)) {
    return next(new ErrorClass("You have already liked this ReplyComment", StatusCodes.BAD_REQUEST)
    );
  }
  ReplyComment.likes.push(req.user._id);
  await ReplyComment.save();
  //socketio
  getIo().emit("likeReplyComment", ReplyComment);

  return res
    .status(StatusCodes.OK)
    .json({ message: "ReplyComment liked Done", ReplyComment });
};

// - Unlike ReplyComment
export const UnlikeReplyComment = async (req, res, next) => {
  const { replyCommentId } = req.params;
  const userId = req.user._id;
  // Check if the ReplyComment exists
  const ReplyComment = await commentReplyModel
    .findById(replyCommentId)
    .populate("createdBy");
  if (!ReplyComment) {
    return next( new ErrorClass("ReplyComment not found", StatusCodes.NOT_FOUND));
  }

  // Check if the user has already liked the ReplyComment
  if (!ReplyComment.likes.includes(userId)) {
    return next(new ErrorClass(
        "You haven't liked this ReplyComment, so you can't unlike it.",
        StatusCodes.BAD_REQUEST
      )
    );
  }
  // Remove the user's id from the likes array
  ReplyComment.likes = ReplyComment.likes.filter((likeUser) => likeUser.toString() !== userId.toString()
  );
  await ReplyComment.save();
  // getIo().to(`room-${ReplyComment.post}`).emit('unlikeReplyComment', ReplyComment);
  getIo().emit("unlikeReplyComment", ReplyComment);

  return res
    .status(StatusCodes.OK)
    .json({ message: "ReplyComment unliked successfully", ReplyComment });
};