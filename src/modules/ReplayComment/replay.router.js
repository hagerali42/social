import * as ReplaycommentController from "./controller/replay.js";
import { Router } from "express";
import * as Val from "./replay.validation.js";
import { auth } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { asyncHandler } from "../../utils/errorHandling.js";

const router = Router();

router.route("/")
//add replaycomment
.post(
  auth,
  validation(Val.AddReplayComment),
  asyncHandler(ReplaycommentController.AddReplayComment)
)


router.route("/:replyCommentId")
//delete replaycomment
.delete(
  auth,
  validation(Val.deleteReplyComment),
  asyncHandler(ReplaycommentController.deleteReplyComment)
)
//update replaycomment
.put(
  auth,
  validation(Val.updateReplyComment),
  asyncHandler(ReplaycommentController.updateReplyComment)
)

// - like replaycomment
router.patch('/like/:replyCommentId',
auth,
validation(Val.deleteReplyComment),
ReplaycommentController.LikeReplyComment

)
// - Unlike replaycomment
router.patch('/Unlike/:replyCommentId',
auth,
validation(Val.deleteReplyComment),
asyncHandler(ReplaycommentController.UnlikeReplyComment)

)




export default router;