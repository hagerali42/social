import joi from 'joi'
import { generalFields } from './../../middleware/validation.js';


export const addPost = {
    body: joi.object().required().keys({
        content: joi.string().min(3).required(),
        privacy:joi.string().valid("friends","only me"),
    }),
    files: joi.object().required().keys({
        images:joi.array().items(generalFields.file).max(4),
        videos:joi.array().items(generalFields.file).max(2),
    }), 
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({})
}
export const updatePost = {
  body: joi
    .object()
    .required()
    .keys({
      content: joi.string().min(3),
      privacy: joi.string().valid("friends", "only me"),
    }),
  files: joi
    .object()
    .required()
    .keys({
      images: joi.array().items(generalFields.file).max(4),
      videos: joi.array().items(generalFields.file).max(2),
    }),
  params: joi.object().required().keys({
    postId: generalFields.id,
  }),
  query: joi.object().required().keys({}),
};

export const deletPost = {
    body: joi.object().required().keys({
    }),
    params: joi.object().required().keys({
        postId:generalFields.id
    }),
    query: joi.object().required().keys({})
}
export const getPost={
    body: joi.object().required().keys({
    }),
    params: joi.object().required().keys({
    }),
}
export const getPostById={
    body: joi.object().required().keys({
    }),
    params: joi.object().required().keys({
        postId:generalFields.id

    }),
    query: joi.object().required().keys({})
}
export const postPrivacy={
    body: joi.object().required().keys({
        privacy:joi.string().valid("friends","only me"),
    }),
    params: joi.object().required().keys({
        postId:generalFields.id

    }),
    query: joi.object().required().keys({})
}


export const created={
    body: joi.object().required().keys({
    }),
    params: joi.object().required().keys({
    }),
    query: joi.object().required().keys({})
}
