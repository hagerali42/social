import { StatusCodes } from "http-status-codes";
import postsModel from "../../../../DB/model/Posts.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import { ErrorClass } from "../../../utils/error.Class.js";
import commentModel from "./../../../../DB/model/Comment.model.js";
import commentReplyModel from "./../../../../DB/model/CommentReplay.model.js";
import userModel from "../../../../DB/model/User.model.js";
import { ApiFeature } from './../../../utils/apiFeatures.js';

// - add post ( valid user only can add post)
export const AddPost = async (req, res, next) => {
  const userId = req.user.id;
  //uplode images for post
  if (req.files && req.files.images) {
    const imagelist = [];
    for (let i = 0; i < req.files.images.length; i++) {
      let { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.images[i].path,
        { folder: "social/user/post" }
      );
      imagelist.push({ secure_url, public_id });
    }
    req.body.images = imagelist;
  }
  // //uplode video for post
  if (req.files && req.files.videos) {
    const videolist = [];
    for (let i = 0; i < req.files.videos.length; i++) {
      let { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.videos[i].path,
        {
          resource_type: "video",
          folder: "social/user/post/videos",
        }
      );
      videolist.push({ secure_url, public_id });
    }
    req.body.videos = videolist;
  }
  req.body.content = req.body.content;
  req.body.createdBy = req.user._id;

  const post = await postsModel.create(req.body);
  return res.status(StatusCodes.OK).json({ message: "Done", post });
};

// - Update post ( by post owner only)
export const updatedPost = async (req, res, next) => {
  const userId = req.user._id;
  const postId = req.params.postId;
  // Find the post by id and check if the createdBy  user's id
  const post = await postsModel.findOne({ _id: postId, createdBy: userId });
  if (!post) {
    return next( new ErrorClass("Post not found", StatusCodes.NOT_FOUND));
  }
  if (req.files.images == null || req.files.images == undefined) {
    //delete old  images
    for (let i = 0; i < post.images.length; i++) {
      const public_id = post.images[i].public_id;
      cloudinary.uploader.destroy(public_id);
    }
    req.body.images = [];
  }
  //  if post have images and will update
  if (req.files.images?.length) {
    const imagelist = [];
    for (let i = 0; i < req.files.images.length; i++) {
      let { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.images[i].path,
        { folder: "social/user/post" }
      );
      //delete old  images
      for (let i = 0; i < post.images.length; i++) {
        const public_id = post.images[i].public_id;
        cloudinary.uploader.destroy(public_id);
      }

      imagelist.push({ secure_url, public_id });
    }
    

    req.body.images = imagelist;
  }

  //  if post have videos and will update
  if (req.files.videos == null || req.files.videos == undefined) {
    //delete old  videos
    for (let i = 0; i < post.videos.length; i++) {
      const public_id = post.videos[i].public_id;
      cloudinary.uploader.destroy(public_id);
    }
    req.body.videos = [];
  }
  
  if (req.files.videos?.length) {
    const videoslist = [];
    for (let i = 0; i < req.files.videos.length; i++) {
      let { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.videos[i].path,
        { resource_type: "video", folder: "social/user/post/videos" }
      );
      //delete old  videos
      for (let i = 0; i < post.videos.length; i++) {
        const public_id = post.videos[i].public_id;
        cloudinary.uploader.destroy(public_id);
      }
      videoslist.push({ secure_url, public_id });
    }

    req.body.videos = videoslist;
  }

  const updateData = { ...req.body };
  post.set(updateData);
  // const updatedPost = await post.save();
  const updatedPost = await postsModel.updateOne({ _id: postId }, req.body, {
    new: true,
  });
  return res
    .status(StatusCodes.OK)
    .json({ message: "Post updated successfully", post: updatedPost });
};
// - Delete post ( by post owner only )(also delete post's comments )(delete pictures from cloudinary also)
export const deletedPost = async (req, res, next) => {
  const userId = req.user._id;
  const postId = req.params.postId;
  // Find the post by id and check if the createdBy  user's id
  const post = await postsModel.findOne({ _id: postId, createdBy: userId });
  if (!post) {
    return next( new ErrorClass("Post not found", StatusCodes.NOT_FOUND));
  }
  // delete post's comments
   await commentModel.deleteMany({ postId: postId });
  // delete post's replay comments
  await commentReplyModel.deleteMany({ commentId: { $in: post.comments } });

  // delete pictures from cloudinary
  if (post.images && post.images.length > 0) {
    for (const image of post.images) {
      const publicId = image.public_id;
      await cloudinary.uploader.destroy(publicId);
    }
  }
  // delete videos from cloudinary
  if (post.videos && post.videos.length > 0) {
    for (const image of post.videos) {
      const publicId = image.public_id;
      await cloudinary.uploader.destroy(publicId);
    }
  }
  // Mark the post as deleted in the database
  await postsModel.updateOne({_id: postId },{isDeleted:true},{new:true})
    //delet from DataBase
  await postsModel.deleteOne({ _id: postId });
  return res.status(StatusCodes.OK).json({ message: "Post deleted successfully" });
};

// - Get all posts with their comments ( user that has isDeleted equal true can’t get posts )

export const getAllPosts = async (req, res, next) => {

  var mongooseQuery = postsModel.find({
      createdBy: { $ne: null },
    })
    .populate("createdBy likes")
      .populate({
        path: "replaycomments",
        populate: {
          path: "createdBy",
          select: "userName image email",
        },
      })
      .populate({
        path: "comments",
        populate: {
          path: "createdBy",
          select: "userName image email",
        },
      });
  //   mongooseQuery = userModel.populate(mongooseQuery, {
  //   path: "comments.createdBy",
  //   select: "userName image email",
  // });

 const apiFeature=new ApiFeature(mongooseQuery,req.query)
//  .pagination(postsModel)
    .search()
    .filter()
    .sort()
    .select();
    const posts = await apiFeature.mongooseQuery;
    return res.status(StatusCodes.OK).json({message:"done",posts});
 
};


// - Get post by id
export const getPostById = async (req, res, next) => {
  const postId = req.params.postId;

  let post = await postsModel
    .findById(postId)
    .populate("createdBy likes")
    .populate({
      path: "replaycomments",
      populate: {
        path: "createdBy",
        select: "userName image email",
      },
    })
    .populate({
      path: "comments",
      populate: {
        path: "createdBy",
        select: "userName image email",
      },
    });
      // post = await userModel.populate(post, {
      //   path: "comments.createdBy",
      //   select: "userName image email",
      // });
    if (!post) {
      return next(new ErrorClass("Post not found", StatusCodes.NOT_FOUND));
    }
    // .populate("comments").populate("replaycomments").populate("createdBy");
  return res.status(StatusCodes.OK).json({ message: "Done", post });
};

// - like post (user can like the post only one time )
export const LikePost = async (req, res, next) => {
  const postId = req.params.postId;
  const post = await postsModel.findById(postId);
  if (!post) {
    return next( new ErrorClass("Post not found", StatusCodes.NOT_FOUND));
  }
  // Check if the user has already liked the post
  if (post.likes.includes(req.user._id)) {
    return next(
      new ErrorClass("You have already liked this post", StatusCodes.BAD_REQUEST)
    );
  }
  post.likes.push(req.user._id);
  await post.save();
  return res.status(StatusCodes.OK).json({ message: "Post liked Done" });
};

// - Unlike post
export const UnlikePost = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.user._id;
    const post = await postsModel.findById(postId);
    if (!post) {
      return next(new ErrorClass("Post not found", StatusCodes.NOT_FOUND));
    }

    // Check if the user has already liked the post
    if (!post.likes.includes(userId)) {
      return next(
        new ErrorClass("You haven't liked this post, so you can't unlike it.", StatusCodes.BAD_REQUEST)
      );
    }

    // Remove the user's id from the likes array
    post.likes = post.likes.filter((likeUser) => likeUser.toString() !== userId.toString());
    await post.save();
    return res.status(StatusCodes.OK).json({ message: "Post unliked successfully" });

};


// - Update post privacy
export const UpdatePostPrivacy = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.user._id;
  const newPrivacy = req.body.privacy; // You can define how the privacy value is sent in the request body

    const post = await postsModel.findById(postId);

    if (!post) {
      return next(new ErrorClass("Post not found", StatusCodes.NOT_FOUND));
    }

    // Check if the user is the owner of the post
    if (post.createdBy.toString() !== userId.toString()) {
      return next(new ErrorClass("You are not the owner of this post", StatusCodes.FORBIDDEN));
    }

    // Update the privacy field of the post
    post.privacy = newPrivacy;
    await post.save();
    return res.status(StatusCodes.OK).json({ message: "Post privacy updated ", post });
};

// - get posts created yesterday
import { startOfDay, endOfDay, subDays } from "date-fns";
export const GetPostsCreatedYesterday = async (req, res, next) => {
    const yesterday = subDays(new Date(), 1); // Calculate yesterday's date
    const startOfYesterday = startOfDay(yesterday); // Start of yesterday (00:00:00)
    const endOfYesterday = endOfDay(yesterday); // End of yesterday (23:59:59)

    const posts = await postsModel.find({
      createdAt: { $gte: startOfYesterday, $lte: endOfYesterday },
    }).populate('comments replaycomments createdBy likes');


    return res.status(StatusCodes.OK).json({ message: "Done", posts });
};

// - get posts created today
export const GetPostsCreatedToday = async (req, res, next) => {
    const today = new Date(); // Get the current date
    const startOfToday = startOfDay(today); // Start of today (00:00:00)
    const endOfToday = endOfDay(today); // End of today (23:59:59)

    const posts = await postsModel.find({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    }).populate('comments replaycomments createdBy likes');

    return res.status(StatusCodes.OK).json({ message: "Done", posts });

};