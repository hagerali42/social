import { model, Schema, Types } from 'mongoose';

const commentSchema = new Schema({
  commentBody: { type: String, required: true },
  createdBy: { type: Types.ObjectId, ref: "User", required: true },
  postId: { type: Types.ObjectId, ref: "Post", required: true },
  replies: [{ type: Types.ObjectId, ref: "CommentReply"}],
  likes: [{ type: Types.ObjectId, ref: "User" }],
});

const commentModel = model('Comment', commentSchema);

export default commentModel;