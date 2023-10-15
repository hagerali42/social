import { Schema, Types, model } from "mongoose";

const userSchema = new Schema(
  {
    userName: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    confirmEmail: { type: Boolean, default: false },
    age: { type: Number },
    gender: { type: String, defulte: "male", enum: ["male", "female"] },
    coverImage: { type: Object },
    image: {
      type: { type: Object },
      required: false,
      default: {
        type: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
      },
    }, //profile pic
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    postsId: [{ type: Types.ObjectId, ref: "Post" }],
    code: { type: String },
    codeExpiration: { type: Date },
    socketId: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

userSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "createdBy",
  justOne: false, // Set to false to get an array of posts
});

userSchema.pre("save", function (next) {
  // console.log(this);
  const [firstName, lastName] = this.userName.split(" ");
  this.firstName = firstName;
  this.lastName = lastName;
  next();
});

const userModel = model("User", userSchema);
export default userModel;
