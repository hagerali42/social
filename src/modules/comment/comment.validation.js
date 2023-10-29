import joi from 'joi'
import { generalFields } from './../../middleware/validation.js';


export const addcomment = {
    body: joi.object().required().keys({
        commentBody: joi.string().required(),
        postId: generalFields.id.required(),
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({})
}
export const updateComment = {
    body: joi.object().required().keys({
        commentBody: joi.string(),
    }),
    params: joi.object().required().keys({
        commentId:generalFields.id
    }),
    query: joi.object().required().keys({})
}
export const deleteComment = {
    body: joi.object().required().keys({
    }),
    params: joi.object().required().keys({
        commentId:generalFields.id
    }),
    query: joi.object().required().keys({})
}
export const getComment = {
  body: joi.object().required().keys({
  }),
  params: joi.object().required().keys({
    postId: generalFields.id,
  }),
  query: joi.object().required().keys({}),
};