import { StatusCodes } from "http-status-codes";
import postsModel from "../../../../DB/model/Posts.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import { ErrorClass } from "../../../utils/error.Class.js";
import commentModel from "./../../../../DB/model/Comment.model.js";
import commentReplyModel from "./../../../../DB/model/CommentReplay.model.js";
import userModel from "../../../../DB/model/User.model.js";
import { ApiFeature } from './../../../utils/apiFeatures.js';
import { getIo } from "../../../utils/socketio.js";
import { startOfDay, endOfDay, subDays } from "date-fns";


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

  const cpost = await postsModel.create(req.body);
  let post = await postsModel
    .findById(cpost._id)
    .populate("createdBy likes")
    .populate({
      path: "comments",
      populate: [
        {
          path: "createdBy likes",
          select: "userName image email",
        },
        {
          path: "replies",
          populate: {
            path: "createdBy likes",
            select: "userName image email",
          },
        },
      ],
    })
    .populate({
      path: "replaycomments",
      populate: {
        path: "createdBy likes",
        select: "userName image email",
      },
    });
  getIo().emit("new post", post);
  return res.status(StatusCodes.OK).json({ message: "Done", post });
};

// - Update post ( by post owner only)
export const updatedPost = async (req, res, next) => {
  const userId = req.user._id;
  const postId = req.params.postId;
 


  // Find the post by id and check if the createdBy  user's id
  const post = await postsModel.findOne({ _id: postId, createdBy: userId });
  const postUth = await postsModel.findOne({createdBy: userId });
  if (!postUth) {
    return next(
      new ErrorClass(
        "You are not Authourized to make this",
        StatusCodes.NOT_FOUND
      )
    );
  }
  if (!post) {
    return next( new ErrorClass("Post not found", StatusCodes.NOT_FOUND));
  }

  //  if post have images and will update
  if (req.files.images && req.files.images.length > 0) {
    const imagelist = [];
    for (let i = 0; i < req.files.images.length; i++) {
      let { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.images[i].path,
        { folder: "social/user/post" }
      );
      //delete old  images
      // for (let i = 0; i < post.images.length; i++) {
      //   const public_id = post.images[i].public_id;
      //   cloudinary.uploader.destroy(public_id);
      // }

      imagelist.push({ secure_url, public_id });
    }
    req.files.images = imagelist;
  }
  
  if (req.files.videos && req.files.videos.length > 0) {
    const videoslist = [];
    for (let i = 0; i < req.files.videos.length; i++) {
      let { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.videos[i].path,
        { resource_type: "video", folder: "social/user/post/videos" }
      );
      //delete old  videos
      // for (let i = 0; i < post.videos.length; i++) {
      //   const public_id = post.videos[i].public_id;
      //   cloudinary.uploader.destroy(public_id);
      // }
      videoslist.push({ secure_url, public_id });
    }

    req.body.videos = videoslist;
  }

  const updateData = {...req.body};

  // Rest of the code remains unchanged
  post.set(updateData);
  const updatedPost = await post.save();
  // const updatedPost = await postsModel.updateOne({ _id: postId }, req.body, {new: true,})
   const postUpdated = await postsModel.findById(updatedPost._id)
     .populate("createdBy likes")
     .populate({
       path: "comments",
       populate: [
         {
           path: "createdBy likes",
           select: "userName image email",
         },
         {
           path: "replies",
           populate: {
             path: "createdBy likes",
             select: "userName image email",
           },
         },
       ],
     })
     .populate({
       path: "replaycomments",
       populate: {
         path: "createdBy likes",
         select: "userName image email",
       },
     });
  getIo().emit("updatePost", postUpdated);
  return res.status(StatusCodes.OK)
    .json({ message: "Post updated successfully", postUpdated });
};
// - Update post ( by post owner only)
export const clearimageIndPost = async (req, res, next) => {
  const userId = req.user._id;
  const {postId} = req.body;
  const { publiclId } = req.body;

  // Find the post by id and check if the createdBy  user's id
  const post = await postsModel.findOne({ _id: postId, createdBy: userId });
  const postUth = await postsModel.findOne({ createdBy: userId });

  if (!postUth) {
    return next(
      new ErrorClass(
        "You are not Authourized to make this",
        StatusCodes.NOT_FOUND
      )
    );
  }
  if (!post) {
    return next( new ErrorClass("Post not found", StatusCodes.NOT_FOUND));
  }

  for (const [i, image] of post.images.entries()) {
    console.log("Comparing:", publiclId, image.public_id);
    if (publiclId == image.public_id) {
      console.log("matched");
      // Delete the image from cloudinary
      await cloudinary.uploader.destroy(publiclId);

      // Remove the image from the images array
      console.log("post.imagesbefore", post.images);

      post.images.splice(i, 1);
      console.log("post.after", post.images);

      // Save the changes to the post
      await post.save();
    }
  }

  const updateData = await post.save();
  const postUpdated = await postsModel
    .findById(updateData._id)
    .populate("createdBy likes")
    .populate({
      path: "comments",
      populate: [
        {
          path: "createdBy likes",
          select: "userName image email",
        },
        {
          path: "replies",
          populate: {
            path: "createdBy likes",
            select: "userName image email",
          },
        },
      ],
    })
    .populate({
      path: "replaycomments",
      populate: {
        path: "createdBy likes",
        select: "userName image email",
      },
    });
  getIo().emit("updatePost", postUpdated);
  return res.status(StatusCodes.OK)
    .json({ message: "Post updated successfully", postUpdated });
};
// - Update post ( by post owner only)
export const clearVedioIndPost = async (req, res, next) => {
  const userId = req.user._id;
  const { postId } = req.body;
  const { publiclId } = req.body;

  // Find the post by id and check if the createdBy  user's id
  const post = await postsModel.findOne({ _id: postId, createdBy: userId });
  const postUth = await postsModel.findOne({ createdBy: userId });

  if (!postUth) {
    return next(
      new ErrorClass(
        "You are not Authourized to make this",
        StatusCodes.NOT_FOUND
      )
    );
  }
  if (!post) {
    return next( new ErrorClass("Post not found", StatusCodes.NOT_FOUND));
  }
  
  for (const [i, video] of post.videos.entries()) {
    if (publiclId == video.public_id) {
      // Delete the image from cloudinary
      await cloudinary.uploader.destroy(publiclId);

      // Remove the image from the images array
      post.images.splice(i, 1);

      // Save the changes to the post
      await post.save();
    }
  }
  const updateData = await post.save();
  const postUpdated = await postsModel
    .findById(updateData._id)
    .populate("createdBy likes")
    .populate({
      path: "comments",
      populate: [
        {
          path: "createdBy likes",
          select: "userName image email",
        },
        {
          path: "replies",
          populate: {
            path: "createdBy likes",
            select: "userName image email",
          },
        },
      ],
    })
    .populate({
      path: "replaycomments",
      populate: {
        path: "createdBy likes",
        select: "userName image email",
      },
    });
  getIo().emit("updatePost", postUpdated);
  return res.status(StatusCodes.OK)
    .json({ message: "Post updated successfully", postUpdated });
};

// - Delete post ( by post owner only )(also delete post's comments )(delete pictures from cloudinary also)
export const deletedPost = async (req, res, next) => {
  const userId = req.user._id;
  const postId = req.params.postId;
  // Find the post by id and check if the createdBy  user's id
  const post = await postsModel.findOne({ _id: postId, createdBy: userId });
  const postUth = await postsModel.findOne({createdBy: userId });
  if (!postUth) {
    return next(
      new ErrorClass(
        "You are not Authourized to delete post",
        StatusCodes.NOT_FOUND
      )
    );
  }
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
  getIo().emit("deletPost",postId)
  return res
    .status(StatusCodes.OK)
    .json({ message: "Post deleted successfully", postId });
};

// - Get all posts with their comments ( user that has isDeleted equal true can’t get posts )

export const getAllPosts = async (req, res, next) => {
  var mongooseQuery = postsModel
    .find({
      createdBy: { $ne: null },
    })
    .populate("createdBy likes")
    .populate({
      path: "comments",
      populate: [
        {
          path: "createdBy likes",
          select: "userName image email",
        },
        {
          path: "replies",
          populate: {
            path: "createdBy likes",
            select: "userName image email",
          },
        },
      ],
    })
    .populate({
      path: "replaycomments",
      populate: {
        path: "createdBy likes",
        select: "userName image email",
      },
    });
 const apiFeature=new ApiFeature(mongooseQuery,req.query)
//  .pagination(postsModel)
    .search()
    .filter()
    .sort()
    .select();
    const posts = await apiFeature.mongooseQuery;
    return res.status(StatusCodes.OK).json({message:"done",posts});
 
};

export const getAllPostsFRomUser = async (req, res, next) => {
    const userId = req.user._id;
  var mongooseQuery = postsModel
    .find({
      createdBy: userId,
    })
    .populate("createdBy likes")
    .populate({
      path: "comments",
      populate: [
        {
          path: "createdBy likes",
          select: "userName image email",
        },
        {
          path: "replies",
          populate: {
            path: "createdBy likes",
            select: "userName image email",
          },
        },
      ],
    })
    .populate({
      path: "replaycomments",
      populate: {
        path: "createdBy likes",
        select: "userName image email",
      },
    });
  const apiFeature = new ApiFeature(mongooseQuery, req.query)
    //  .pagination(postsModel)
    .search()
    .filter()
    .sort()
    .select();
  const posts = await apiFeature.mongooseQuery;
  return res.status(StatusCodes.OK).json({ message: "done", posts });
};
// - Get post by id
export const getPostById = async (req, res, next) => {
  const postId = req.params.postId;

  let post = await postsModel
    .findById(postId)
    .populate("createdBy likes")
    .populate({
    path: "comments",
     populate: [
          {
            path: "createdBy likes",
            select: "userName image email",
          },
          {
            path: "replies",
            populate: {
              path: "createdBy likes",
              select: "userName image email",
            },
          },
        ],
    })
    .populate({
      path: "replaycomments",
      populate: {
        path: "createdBy likes",
        select: "userName image email",
      },
    });
    if (!post) {
      return next(new ErrorClass("Post not found", StatusCodes.NOT_FOUND));
    }
    // .populate("comments").populate("replaycomments").populate("createdBy");
  return res.status(StatusCodes.OK).json({ message: "Done", post });
};

// - like post (user can like the post only one time )
export const LikePost = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.user._id;
  const post = await postsModel
    .findById(postId)
    .populate("createdBy likes")
    .populate({
      path: "comments",
      populate: [
        {
          path: "createdBy likes",
          select: "userName image email",
        },
        {
          path: "replies",
          populate: {
            path: "createdBy likes",
            select: "userName image email",
          },
        },
      ],
    })
    .populate({
      path: "replaycomments",
      populate: {
        path: "createdBy likes",
        select: "userName image email",
      },
    });
  if (!post) {
    return next(new ErrorClass("Post not found", StatusCodes.NOT_FOUND));
  }
  // Check if the user has already liked the post
  const userLiked = post.likes.some(
    (like) => like._id.toString() === userId.toString()
  );

  if (userLiked) {
    return next(
      new ErrorClass(
        "You have already liked this post",
        StatusCodes.BAD_REQUEST
      )
    );
  }
 
  // Add a like to the post
  post.likes.push(userId);
  await post.save();
  getIo().emit("likePost", post);
  return res.status(StatusCodes.OK).json({ message: "Post liked Done", post });
};

// - Unlike post
export const UnlikePost = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.user._id;
  const post = await postsModel
    .findById(postId)
    .populate("createdBy likes")
    .populate({
      path: "comments",
      populate: [
        {
          path: "createdBy likes",
          select: "userName image email",
        },
        {
          path: "replies",
          populate: {
            path: "createdBy likes",
            select: "userName image email",
          },
        },
      ],
    })
    .populate({
      path: "replaycomments",
      populate: {
        path: "createdBy likes",
        select: "userName image email",
      },
    });
  if (!post) {
    return next(new ErrorClass("Post not found", StatusCodes.NOT_FOUND));
  }
  // Check if the user has already liked the post
  const userLiked = post.likes.some(
    (like) => like._id.toString() === userId.toString()
  );

  if (!userLiked) {
    return next(
      new ErrorClass(
        "You haven't liked this post, so you can't unlike it.",
        StatusCodes.BAD_REQUEST
      )
    );
  }

  // Remove the user's ID from the 'likes' array
  post.likes = post.likes.filter(
    (like) => like._id.toString() !== userId.toString()
  );

  // Save the updated post
  await post.save();
  getIo().emit("unlikePost", post);
  return res
    .status(StatusCodes.OK)
    .json({ message: "Post unliked successfully", post });
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