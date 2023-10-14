import { model, Schema, Types } from 'mongoose';


const chatSchema = new Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: Types.ObjectId, ref: "User", required: false }],
    latestMessage: {
      type: Types.ObjectId,
      ref: "Message",
      required: false,
    },
    groupAdmin: {
      type: Types.ObjectId,
      ref: "User",
      required: false,
    },

  },
  {
    timestamps: true,
  }
);

const chatModel = model('Chat', chatSchema)

export default chatModel