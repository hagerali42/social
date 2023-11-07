import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const getProfile={
    body: joi.object().required().keys({
    }),
    params:joi.object().required().keys({}),
    query: joi.object().required().keys({}), 
}
export const updateProfile={
    body: joi.object().required().keys({
        userName:generalFields.name,
        email: generalFields.email,
        phone:joi.string().pattern( new RegExp(/^01[0125][0-9]{8}$/)),
        age:joi.number().min(10).max(100).integer().positive(),
    }),
    params:joi.object().required().keys({}),
    query: joi.object().required().keys({}), 
}

export const addProfilePicture = {
    body: joi.object().required().keys({
    }),
    file: generalFields.file, // image validation
    params:joi.object().required().keys({}),
    query: joi.object().required().keys({}),
}
export const change_password = {
  body: joi
    .object()
    .required()
    .keys({
      oldPassword: generalFields.password.required(),
      newPassword: generalFields.password.required(),
      cPassword: joi.string().valid(joi.ref("newPassword")),
    }),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};
export const deleteSoft={
    body: joi.object().required().keys({
    }),
    params:joi.object().required().keys({}),
    query: joi.object().required().keys({}), 
}
export const getall = {
  body: joi.object().required().keys({}),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({
    search:joi.string()
  }),
};



