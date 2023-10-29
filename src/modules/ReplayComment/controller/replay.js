
import { StatusCodes } from "http-status-codes";
import commentModel from "../../../../DB/model/Comment.model.js";
import postsModel from "../../../../DB/model/Posts.model.js";
import { ErrorClass } from "../../../utils/error.Class.js";
import userModel from "../../../../DB/model/User.model.js";
import commentReplyModel from "../../../../DB/model/CommentReplay.model.js";

// - replay ( can’t add reply comment on post has isDeleted equal true , user that has isDeleted equal true can’t add replay comment )
export const AddReplayComment = async (req, res, next) => {
    const { replyBody, commentId } = req.body;
    const userId = req.user._id;

    // Check if the comment exists
    const comment = await commentModel.findById(commentId);
    if (!comment) {
        return next(new ErrorClass('Comment not found', StatusCodes.NOT_FOUND));
    }
    // Check if the post associated with the comment has isDeleted equal to true
    const post = await postsModel.findById(comment.postId);
    if (!post || post.isDeleted) {
      return next(new ErrorClass('Cannot add reply comment to a deleted post', StatusCodes.BAD_REQUEST));
    }
  
    // Check if the user has isDeleted equal to true
      const user = await userModel.findById(userId);
    if (!user || user.isDeleted) {
      return next(new ErrorClass("Cannot add reply comment as a deleted user", StatusCodes.NOT_FOUND))
    }
    
    // Create and save the reply comment
      const replyComment = await commentReplyModel.create({
          replyBody,
          createdBy:userId,
          commentId,
          postId:comment.postId,
        });

    return res.status(StatusCodes.OK).json({ message: "Done", replyComment });
  };

  // - Update updateReplyComment ( by ReplyComment owner only )
export const updateReplyComment=async  (req ,res,next)=>{
  const { replyBody } = req.body;
  const { replyCommentId } = req.params;
  const userId = req.user._id;
  // Check if the replyCommentId exists
  const replayComment = await commentReplyModel.findById(replyCommentId);
  if (!replyCommentId) {
    return next( new ErrorClass("replyCommentId not found", StatusCodes.NOT_FOUND));
  }
  // Check if the user is the owner of the replyCommentId
  if (replayComment.createdBy.toString() != userId) {
    return next( new ErrorClass("You are not authorized to update this replayComment",StatusCodes.UNAUTHORIZED));}
    replayComment.replyBody = replyBody;
  await replayComment.save();
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
    if (ReplyComment.createdBy.toString() != userId) {
      return next(
        new ErrorClass(
          "You are not authorized to delete this ReplyComment",
          StatusCodes.UNAUTHORIZED
        )
      );
    }
    await commentReplyModel.deleteOne({ _id: replyCommentId });
    return res.status(StatusCodes.OK).json({ message: " ReplyComment deleted " });
};

// - like ReplyComment (user can like the ReplyComment only one time )
export const LikeReplyComment = async (req, res, next) => {
  const { replyCommentId } = req.params;
  // Check if the ReplyComment exists
  const ReplyComment = await commentReplyModel.findById(replyCommentId);
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
  return res.status(StatusCodes.OK).json({ message: "ReplyComment liked Done" });
};

// - Unlike ReplyComment
export const UnlikeReplyComment = async (req, res, next) => {
  const { replyCommentId } = req.params;
  const userId = req.user._id;
  // Check if the ReplyComment exists
  const ReplyComment = await commentReplyModel.findById(replyCommentId);
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
  return res.status(StatusCodes.OK).json({ message: "ReplyComment unliked successfully" });
};