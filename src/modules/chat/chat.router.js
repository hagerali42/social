import { Router } from "express";
import * as chatController from './controller/chat.js'
import { asyncHandler } from './../../utils/errorHandling.js';
import { auth } from "../../middleware/auth.js";
const router =Router()

router.route("/")
    .post(
        auth,
        asyncHandler(chatController.accessChat)
    )
    .get(
        auth,
        asyncHandler(chatController.fetchChats)
    );


router.route("/group")
    .post(
        auth,
        asyncHandler(chatController.createGroupChat)
    );
   

router.route("/rename")
    .put(
        auth,
       asyncHandler( chatController.renameGroup)
    );

router.route("/groupremove")
    .put(
        auth,
        asyncHandler(chatController.removeFromGroup)
    );
router.route("/groupadd")
    .put(
        auth,
        asyncHandler(chatController.addToGroup)
    );





export default router