import userModel from "../../../../DB/model/User.model.js"
import { asyncHandler } from "../../../utils/errorHandling.js";
import cloudinary from "../../../utils/cloudinary.js";
import { StatusCodes } from "http-status-codes";
import { compare ,hash} from "../../../utils/HashAndCompare.js";
import { generateToken } from "../../../utils/GenerateAndVerifyToken.js";
import CryptoJS from "crypto-js";
import sendEmail from "../../../utils/email.js";
import { ErrorClass } from "../../../utils/error.Class.js";
import { getIo } from "../../../utils/socketio.js";

// - Get user profile
export const getprofile =async(req, res, next) => {  
    const userProfile=await userModel.findById(req.user._id).populate('posts') 
      // Decrypt the phone number
      return res.status(StatusCodes.OK).json({ message: 'Done' ,userProfile});
    }
// - update profile ( if you update your email you should confirm the new email also )
export const updateprofile =async(req, res, next) => {
    const user = req.user;
// if you update your email you should confirm the new email also 
  if (req.body.email) {
      //if email already founded and is not owner user email  
    const isEmailExist = await userModel.findOne({email: req.body.email,_id: { $ne: req.user._id },});
      if (isEmailExist) {
        return next(
          new ErrorClass("email already exists", StatusCodes.BAD_REQUEST)
        );
      }
      await userModel.updateOne({confirmEmail:false})
  //5-send emailc
   const email=req.body.email
    const token = generateToken({payload: { email},expiresIn: 60 * 5,signature: process.env.EMAIL_SIGNATURE});
  //*new request to confirm email valid 1 month ago(_ Refresh token)///////////////
  const refreshToken = generateToken({payload: { email },expiresIn: 60 * 60 * 24 * 30,signature: process.env.EMAIL_SIGNATURE});

  const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}`;
  const rfLink = `${req.protocol}://${req.headers.host}/auth/newconfirmEmail/${refreshToken}`;

  const html = `<!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
    <style type="text/css">
    body{background-color: #88BDBF;margin: 0px;}
    </style>
    <body style="margin:0px;"> 
    <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
    <tr>
    <td>
    <table border="0" width="100%">
    <tr>
    <td>
    <h1>
        <img width="100px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png"/>
    </h1>
    </td>
    <td>
    <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    <tr>
    <td>
    <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
    <tr>
    <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
    <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
    </td>
    </tr>

    <tr>
    <td>
    <h1 tyle="margin:0px;>Email Confirmation</h1>
    </td>
    </tr>

    <tr>
    <td>
    <p style="padding:0px 100px;">
    </p>
    </td>
    </tr>

    <tr>
    <td>
    <a href="${link}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Verify Email address</a>
    </td>
    </tr>
       <br>
       <br>
    <tr>
    <td>
    <a href="${rfLink}" style="margin:30px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">New Confirm Email</a>
    </td>
    </tr>

    </table>
    </td>
    </tr>
    <tr>
    <td>
    <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
    <tr>
    <td>
    <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
    </td>
    </tr>
    <tr>
    <td>
    <div style="margin-top:20px;">

    <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
    
    <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
    </a>
    
    <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
    </a>

    </div>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </table>
    </body>
    </html>`;
  if (!await sendEmail({ to: email, subject: "Confirm email", html })) {
    redirect("https://bejewelled-speculoos-83b998.netlify.app");
    return next(new ErrorClass("Email rejected", StatusCodes.NOT_FOUND));
  }      
     req.body.email = req.body.email
    }  

  if( req.body.userName){
      req.body.userName= req.body.userName    
    }
  if( req.body.age){
      req.body.age= req.body.age    
    }
  if( req.body.phone){
    req.body.phone = req.body.phone;
    }

  const userProfile=await userModel.findByIdAndUpdate({_id:req.user._id},req.body);
  return res.status(StatusCodes.OK).json({ message: 'Done' ,userProfile});
  
  }

// - add profile picture( the new picture must override the old one in the host also )
export const addProfilePicture=async(req, res, next) => {
  const user = req.user; //from middleware
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: "social/user/profile" }
  );
 if(user.image){
  await cloudinary.uploader.destroy(user.image.public_id);
 }
  //2-save file path in database
  await userModel.updateOne(
    { _id: req.user._id },
    { image: { secure_url, public_id } },
    { new: true }
  );

  return res
    .status(StatusCodes.OK)
    .json({ message: "Done", uploadeImage: { secure_url, public_id } });
}

// - add cover pictures ( keep the pervious ones )
export const profilecover= async (req, res, next) => {
  const user = req.user; //from middleware
  if (!req.file || !req.file.path) {
    return res .status(StatusCodes.BAD_REQUEST).json({ message: "No cover image provided" });
  }

  // 1. Upload profile picture to Cloudinary
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: 'social/user/cover' }
  );

  // 2. Save file path in the database
  await userModel.updateOne(
    { _id: req.user._id },
    { coverImage: { secure_url, public_id } },
    { new: true }
  );
  return res
    .status(StatusCodes.OK)
    .json({ message: "Done", coverImage: { secure_url, public_id }});
}
 
// - update password ( old password must be different from the new password )
export const changePassword =async(req,res,next) => {
  const user = req.user; //FROM auth middleware
  const { oldPassword, newPassword } = req.body;
  console.log("O", oldPassword);
  console.log("N", newPassword);

  if (oldPassword.toString() === newPassword.toString()) {
    return next(
      new ErrorClass(
        "Old and new passwords cannot be the same",
        StatusCodes.FORBIDDEN
      )
    );
    
  }
  const match = compare({ plaintext: oldPassword, hashValue: user.password });
if (!match) {
  return next(
    new ErrorClass("Invalid old password", StatusCodes.NOT_ACCEPTABLE)
  );
}
  let hashPassword = hash({ plaintext: newPassword });
  await userModel.updateOne({ _id: user._id }, { password: hashPassword });
  return res.status(StatusCodes.OK).json({ message: "Password updated" });
}

// - SoftDelete profile ( by account owner only )
export const deleteSoft =async(req, res, next) => {
      const userId = req.user._id;
      await userModel.findByIdAndUpdate(userId,{isDeleted:true})
     return res.status(StatusCodes.OK).json({ message: 'User soft deleted'});
  }



export const getAlluserass = async (req, res, next) => {
       const keyword = req.query.search ? {
         $or: [
           { firstName: { $regex: req.query.search, $options: "i" } },
           { lastName: { $regex: req.query.search, $options: "i" } },
           { email: { $regex: req.query.search, $options: "i" } },
         ]
       } : {
         
       };
        const users=await userModel.find(keyword).populate('posts') ;
        users.map(user=>{
          return user.phone= CryptoJS.AES.decrypt(user.phone, process.env.TOKEN_SIGNATURE).toString(CryptoJS.enc.Utf8);
        })
        return res.status(StatusCodes.OK).json({ message: 'Done' ,users});
    
    }


