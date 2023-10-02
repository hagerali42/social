import { Router } from "express";
import * as chatController from './controller/chat.js'
import { asyncHandler } from './../../utils/errorHandling.js';
import { auth } from "../../middleware/auth.js";
const router =Router()


router.post('/',
auth,
asyncHandler(chatController.sendMessage)
)


router.get('/ovo/:destId',
auth,
asyncHandler(chatController.getChat)
)




export default router