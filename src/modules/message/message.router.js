import { Router } from "express";
import * as MsgController from "./controller/message.js";
import { auth } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import * as Val from "./message.validation.js"
import { asyncHandler } from './../../utils/errorHandling.js';
const router = Router();
  //send message
router.route("/")
  .post(
    auth,
    validation(Val.sendMessage),
    asyncHandler(MsgController)
);
  

  //get all of message of this chat
router.route("/:chatId")
  .get(
    auth,
    validation(Val.allMessages),
    asyncHandler(MsgController.allMessages)
);



export default router;
