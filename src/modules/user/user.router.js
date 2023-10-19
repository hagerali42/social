
import * as userController from './controller/user.controller.js'
import { Router } from "express";
import { validation } from '../../middleware/validation.js';
import * as Val from './validation.js';
import { auth } from '../../middleware/auth.js';
import { fileUpload, fileValidation } from '../../utils/multer.js';
import { asyncHandler } from './../../utils/errorHandling.js';

const router = Router()

router.get('/profile',
  auth,
  validation(Val.getProfile),
  asyncHandler(userController.getprofile)
)
router.put('/profile',
  auth,
   validation(Val.updateProfile),
  asyncHandler(  userController.updateprofile)
)

//update profile-picture
router.patch('/profilePic',
auth,
fileUpload(fileValidation.image).single('image'),
validation(Val.addProfilePicture),
asyncHandler(userController.addProfilePicture ))

// - add cover pictures ( keep the pervious ones )
router.patch('/profileCover',
auth,
fileUpload(fileValidation.image).single('coverImage'),
validation(Val.addProfilePicture),
userController.profilecover )


// change password 
router.patch('/change-password',
auth ,
validation(Val.change_password),
asyncHandler(userController.changePassword) )

// -soft delete(user must be logged in)
router.patch('/soft-delete',
auth,
validation(Val.deleteSoft),
asyncHandler(userController.deleteSoft) )


//-get All users with search
router.get(
  "/all",
  validation(Val.getall),
  asyncHandler(userController.getAlluserass)
);








export default router