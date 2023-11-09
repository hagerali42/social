import { StatusCodes } from "http-status-codes";
import userModel from "./../../../../DB/model/User.model.js";
import { ErrorClass } from "./../../../utils/error.Class.js";
import { generateToken, verifyToken,} from "./../../../utils/GenerateAndVerifyToken.js";
import sendEmail from "../../../utils/email.js";
import { compare, hash } from "../../../utils/HashAndCompare.js";
import cloudinary from "../../../utils/cloudinary.js";
import {OAuth2Client} from'google-auth-library';
const client = new OAuth2Client();
import CryptoJS from "crypto-js";
//- SignUp ( hash password , encrypt phone , send confirmation email )&& - Refresh token

export const signup = async (req, res, next) => {
  const { email } = req.body;
//1-ckeck email is exisit
  const checkUser = await userModel.findOne({ email });
  if (checkUser) {
    return next(new ErrorClass("Email exists", StatusCodes.CONFLICT));
  }

//2-hashedPassword
  req.body.password = hash({ plaintext: req.body.password  });
  req.body.phone = req.body.phone; 

  //image
  if(req.files?.image){
    const {secure_url,public_id}=await cloudinary.uploader.upload(
      req.files.image[0].path,{folder:'social/user/profile'})
    req.body.image = {secure_url,public_id}
  }

  if (req.files?.coverImage) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files.coverImage[0].path,{folder:'social/user/cover'});
    req.body.coverImage = { secure_url, public_id };
  }

//4-create new user
  const user = await userModel.create(req.body);
   
//5-send email
  const token = generateToken({payload: { email },expiresIn: 60 * 5,signature: process.env.EMAIL_SIGNATURE});
  //*new request to confirm email valid 1 month ago(_ Refresh token)///////////////
  const refreshToken = generateToken({payload: { email },expiresIn: 60 * 60 * 24 * 30,signature: process.env.EMAIL_SIGNATURE});
  //*new request to unsubscribe
  const unsubscribe = generateToken({payload: { email ,userId:user._id},signature: process.env.EMAIL_SIGNATURE});

  const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}`;
  const rfLink = `${req.protocol}://${req.headers.host}/auth/newconfirmEmail/${refreshToken}`;
  const unsubLink = `${req.protocol}://${req.headers.host}/auth/unsubscribe/${unsubscribe}`;

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

    <br>
    <br>
    <tr>
    <td>
    <a href="${unsubLink}" style="margin:30px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:red; text-decoration: none; ">Unsubscribe</a>
    </td>
    </tr>
    <br>

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
      redirect("https://sensational-cupcake-842ea3.netlify.app");
    return next(new ErrorClass("Email rejected", StatusCodes.NOT_FOUND));
  }

  return res.status(StatusCodes.CREATED).json({ message: "Done", user });
};

//-confirmEmail
export const confirmEmail = async (req, res, next) => {
  const { token } = req.params;
  const { email } = verifyToken({token,signature: process.env.EMAIL_SIGNATURE,});
  if (!email) {
    return next(new ErrorClass(" In-vaild token payload", StatusCodes.BAD_REQUEST));
  }
  const user = await userModel.updateOne({email}, { confirmEmail: true });

  if (user.matchedCount) {
    return res
      .status(200)
      .redirect("https://sensational-cupcake-842ea3.netlify.app");
  } else {
    return res.status(400).render(`confirmEmail`, { message: "NOT registered Account" });
    // return res.statuse(400).redirect(`${process.env.FE_URL}/#/NotFound`)
    //    return res.send(`<a href="">Ops You Dont have an Account</a>`);
  }
};
//-new-confirmEmail
export const newconfirmEmail = async (req, res, next) => {
  const { token } = req.params;
  const { email } = verifyToken({token,signature: process.env.EMAIL_SIGNATURE,});
  if (!email) {
    return next(new ErrorClass(" In-vaild token payload", StatusCodes.BAD_REQUEST));
  }
  if (!user) {
    return next(new ErrorClass(`Not Register accouunt`, StatusCodes.BAD_REQUEST)); //res.redirect("URL of SignUp Page")
  }
  if (user.confirmEmail) {
    return res
      .status(200)
      .redirect("https://sensational-cupcake-842ea3.netlify.app");
    // return next(new Error(`'your Email confirmedd  please login in!!!'`)); //res.redirect("URL of Login Page")
  }

  //if user founded and confirm email==false   Send new email
  const newToken = generateToken({payload: { email },signature: process.env.EMAIL_SIGNATURE,expiresIn: 60 * 3});

  const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${newToken}`;
  const rfLink = `${req.protocol}://${req.headers.host}/auth/newconfirmEmail/${token}`;

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

  <br>
  <br>
  <tr>
  <td>
  <a href="${unsubLink}" style="margin:30px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:red; text-decoration: none; ">Unsubscribe</a>
  </td>
  </tr>
  <br>

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

  if (!await sendEmail({ to: email, subject: "New Confirm email", html })) {
    // redirect("/auth");
    return next(new ErrorClass("Email rejected", StatusCodes.NOT_FOUND));
  }
  return res.status(200).send("<h1> new confirmation email sent check your inbox now</h1>");
};
//-unsubscribe
export const unsubscribe = async (req, res, next) => {
  const { token } = req.params;
  const decoded = verifyToken({token,signature: process.env.EMAIL_SIGNATURE,});
  const user = await userModel.findByIdAndDelete(decoded.id);
  if (!user) {
    return next(new ErrorClass(`<a href="">Ops You Dont have an Account</a>`,  StatusCodes.BAD_REQUEST) ); //res.redirect("URL of SignUp Page")
  }
  if (user) {
    res.status(200).json({ message: "Email Deleted !!Register Now" }); //res.redirect("URL of SignUp Page")
  }
};

// - SignIn ( must be confirmed and not deleted  
export const login= async (req, res, next) =>{
 const {email,password} = req.body
 const user = await userModel.findOne({ email });
 if (!user) {
   return next(new ErrorClass("In-valid User Data", StatusCodes.NOT_ACCEPTABLE));
 }
//  must be confirmed and not deleted
 if(!user.confirmEmail || user.isDeleted==true){
  return next(new ErrorClass("Email Not Confirmed or deleted", StatusCodes.NOT_ACCEPTABLE));
 }
 const match =compare({plaintext:password,hashValue:user.password})
 if (!match) {
  return next(new ErrorClass("In-valid User Data", StatusCodes.NOT_ACCEPTABLE));
}
const token =generateToken({
  payload:{
    id:user._id,
    email:user.email,
  },
  expiresIn:60*30
})
const refresh_token =generateToken({
  payload:{
    id:user._id,
    email:user.email,
  },
  expiresIn:60*60*24*30
})

return res.status(StatusCodes.OK).json({message:'Done', token,refresh_token,user})

}

export const forgotPassword =async (req, res,next) => {
  const {email} = req.body
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new ErrorClass(" User not found", StatusCodes.NOT_FOUND));
  }
  // Generate a new code and set its expiration to 5 minutes from now
  const code =  Math.floor(100000 + Math.random() * 900000); 
  const codeExpiration = new Date();
  codeExpiration.setMinutes(codeExpiration.getMinutes() + 5); // 5 minutes from now

  const html=` 
  <h3 style="margin-top:10px; color:#000"> this code to verification</h3>
  <span style="background-color:##26acdc;height:500px;font-size:30px;color:#fff">${code}</span>`
  await sendEmail({ to: email, subject: "Forget Password", html })

  // Update user's code and code expiration
  await userModel.updateOne({ email }, { code, codeExpiration });
  return res.status(StatusCodes.OK).json({message:'Done'})
}

export const resetPassword =async (req, res,next) => {
  let {email,code ,password} = req.body
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new ErrorClass(" User not found", StatusCodes.NOT_FOUND));
  }
   // Check if the code has expired
   if (!user.codeExpiration || user.codeExpiration < new Date()) {
    return next(new ErrorClass("Code has expired", StatusCodes.BAD_REQUEST));
  }
  // Check if the provided code matches the stored code
    if (code != user.code) {
      return next(new ErrorClass("Invalid code", StatusCodes.BAD_REQUEST));
    }

  password = hash({ plaintext: password });
  let newcode=Math.floor(100000 + Math.random() * 900000); 
  // Clear the code and codeExpiration fields after successful reset
  await userModel.updateOne({ email }, { password, code: newcode, codeExpiration: null });
  return res.status(StatusCodes.OK).json({message:'Done'})
}

 //!google-login
// export const socialLogin=async(req,res,next)=>{
// const {idToken}=req.body

// async function verify() {
//   const ticket = await client.verifyIdToken({
//       idToken,
//       audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
//       // Or, if multiple clients access the backend:
//       //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
//   });
//   const userPayload = ticket.getPayload();
  
// }
// verify().catch(
//   (error)=>{
//     return next( new ErrorClass(error,500))
//   }
// );

// }