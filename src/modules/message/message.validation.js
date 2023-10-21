import joi from "joi";
import { generalFields } from "../../middleware/validation.js";



export const allMessages = {
  body: joi.object().required().keys({}),
  params: joi.object().required().keys({
    chatId: generalFields.id,
  }),
  query: joi.object().required().keys({}),
};
export const sendMessage = {
  body: joi.object().required().keys({
    chatId: generalFields.id,
    content: joi.string().required(),
  }),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};
