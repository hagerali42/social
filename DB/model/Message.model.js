import { model, Schema, Types } from "mongoose";

const messageSchema = new Schema(
  {
    sender: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, trim: true },
    chat: {
      type: Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    readBy: [{ type: Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

const messageModel = model("Message", messageSchema);

export default messageModel;
