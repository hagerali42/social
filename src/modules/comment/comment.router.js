import * as commentController from "./controller/comment.js";
import { Router } from "express";
import * as Val from "./comment.validation.js";
import { auth } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { asyncHandler } from "../../utils/errorHandling.js";

const router = Router();

router.route("/")
//addcomment
.post(
  auth,
  validation(Val.addcomment),
  asyncHandler(commentController.AddComment)
)
router
  .route("/post/:postId")
  .get(
    auth,
    validation(Val.getComment),
    asyncHandler(commentController.getComment)
  );

router.route("/:commentId")
//delete comment
.delete(
  auth,
  validation(Val.deleteComment),
  asyncHandler(commentController.deleteComment)
)
//update comment
.put(
  auth,
  validation(Val.updateComment),
  commentController.updateComment
)
// - like comment
router.patch('/like/:commentId',
auth,
validation(Val.deleteComment),
asyncHandler(commentController.LikeComment)

)
// - Unlike comment
router.patch('/Unlike/:commentId',
auth,
validation(Val.deleteComment),
asyncHandler(commentController.UnlikeComment)

)




export default router;