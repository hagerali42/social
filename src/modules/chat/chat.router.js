import { Router } from "express";
import * as chatController from './controller/chat.js'
import { asyncHandler } from './../../utils/errorHandling.js';
import * as Val from './chat.validation.js'
import { auth } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
const router =Router()

router
  .route("/")
  .post(
    auth,
    validation(Val.accessChat),
    asyncHandler(chatController.accessChat)
  )
  .get(
    auth,
    validation(Val.fetchChats),
    asyncHandler(chatController.fetchChats)
  );


router.route("/group")
    .post(
        auth,
        validation(Val.createGroupChat),
        asyncHandler(chatController.createGroupChat)
    );
   

router.route("/rename")
    .put(
        auth,
        validation(Val.updateRoomName),
       asyncHandler( chatController.renameGroup)
    );

router
  .route("/groupremove")
  .put(
    auth,
    validation(Val.addUsersToGroupOrDElet),
    asyncHandler(chatController.removeFromGroup)
  );
router
  .route("/groupadd")
  .put(
    auth,
    validation(Val.addUsersToGroupOrDElet),
    asyncHandler(chatController.addToGroup)
  );





export default router