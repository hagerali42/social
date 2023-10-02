import joi from 'joi'
import { generalFields } from './../../middleware/validation.js';


export const AddReplayComment = {
    body: joi.object().required().keys({
        replyBody: joi.string().required(),
        commentId: generalFields.id.required(),
    }),
    params: joi.object().required().keys({}),
    query: joi.object().required().keys({})
}
export const updateReplyComment = {
    body: joi.object().required().keys({
        replyBody: joi.string(),
    }),
    params: joi.object().required().keys({
        replyCommentId:generalFields.id
    }),
    query: joi.object().required().keys({})
}

export const deleteReplyComment = {
    body: joi.object().required().keys({
    }),
    params: joi.object().required().keys({
        replyCommentId:generalFields.id
    }),
    query: joi.object().required().keys({})
}