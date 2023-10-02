import { Router } from "express";
import * as authController from './controller/registration.js'
import { asyncHandler } from './../../utils/errorHandling.js';
import { validation } from './../../middleware/validation.js';
import * as Val from './auth.validation.js'
import { fileUpload, fileValidation } from "../../utils/multer.js";
const router = Router()

router.post('/signup',
fileUpload(fileValidation.image).fields([
    {name:'image',maxCount:1},
    {name:'coverImage',maxCount:1},
]),
validation(Val.signup),
authController.signup
 )

router.get('/confirmEmail/:token',
asyncHandler(authController.confirmEmail)
)
router.get('/newconfirmEmail/:token',
asyncHandler(authController.newconfirmEmail)
)
router.get('/unsubscribe/:token',
asyncHandler(authController.unsubscribe)
)

router.post('/login',
validation(Val.login),
asyncHandler(authController.login)
)

router.put('/forgetPassword',
validation(Val.forgetPassword),
asyncHandler(authController.forgotPassword)
)

router.put('/resetPassword',
validation(Val.resetPassword),
asyncHandler(authController.resetPassword)
)


//social login
router.post('/google-login',
asyncHandler(authController.socialLogin)
)

export default router