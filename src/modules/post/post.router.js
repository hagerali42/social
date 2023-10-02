import * as postController from "./controller/post.js";
import { Router } from "express";
import * as Val from "./post.validation.js";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import { auth } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { asyncHandler } from "../../utils/errorHandling.js";

const router = Router();

router.route("/")
//addPost
.post(
  auth,
  fileUpload([...fileValidation.image, ...fileValidation.video]).fields([
    { name: "images", maxCount: 4 },
    { name: "videos", maxCount: 2 },
  ]),

  validation(Val.addPost),
  asyncHandler(postController.AddPost)
)
//get all postes 
.get(
    validation(Val.getPost),
    asyncHandler(postController.getAllPosts)
)

router.route("/:postId")
//updatePost
.put(
    auth,
    fileUpload([...fileValidation.image, ...fileValidation.video]).fields([
      { name: "images", maxCount: 4 },
      { name: "videos", maxCount: 2 },
    ]),
    validation(Val.updatePost),
    asyncHandler(postController.updatedPost)
  )

  //delet post
.delete(
    auth,
    fileUpload([...fileValidation.image, ...fileValidation.video]).fields([
      { name: "images", maxCount: 4 },
      { name: "videos", maxCount: 2 },
    ]),
    validation(Val.deletPost),
    asyncHandler(postController.deletedPost)
  )
//get post byID
.get(
    validation(Val.getPostById),
    asyncHandler(postController.getPostById)
)
// - like post
router.patch('/like/:postId',
auth,
validation(Val.getPostById),
asyncHandler(postController.LikePost)

)
// - Unlike post
router.patch('/Unlike/:postId',
auth,
validation(Val.getPostById),
asyncHandler(postController.UnlikePost)

)
// - Update post privacy
router.patch('/privacy/:postId',
auth,
validation(Val.postPrivacy),
asyncHandler(postController.UpdatePostPrivacy)

)
// - get posts created yesterday
router.get('/created/yesterday',
validation(Val.created),
asyncHandler(postController.GetPostsCreatedYesterday)
)
// - get posts created today
router.get('/created/today',
validation(Val.created),
asyncHandler(postController.GetPostsCreatedToday)
)


export default router;
