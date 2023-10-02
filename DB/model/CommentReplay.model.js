import { model, Schema, Types } from 'mongoose';

const ReplaycommentSchema = new Schema({

  replyBody: { type: String, required: true },
  createdBy: { type: Types.ObjectId, ref: 'User', required: true },
  commentId: { type: Types.ObjectId, ref: 'Comment', required: true },
  likes: [{ type: Types.ObjectId, ref: 'User' }],
  postId: { type: Types.ObjectId, ref: 'Post',},

});

const replaycommentModel = model('CommentReply', ReplaycommentSchema);

export default replaycommentModel;