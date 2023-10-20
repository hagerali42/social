import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const accessChat = {
  body: joi
    .object()
    .required()
    .keys({
      userId: generalFields.id,
      chatName: joi.string(),
   
    }),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};

export const fetchChats = {
  body: joi.object().required().keys({
  }),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};

export const createGroupChat = {
  body: joi
    .object()
    .required()
    .keys({
      name: joi.string().required(),
      users: joi.array().items(generalFields.id).required(), // Allow an array of strings
    }),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};


export const updateRoomName = {
  body: joi.object().required().keys({
    chatId: generalFields.id,
    chatName: joi.string().required(),
  }),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};
export const addUsersToGroupOrDElet = {
  body: joi.object().required().keys({
    chatId: generalFields.id,
    userId: generalFields.id,
  }),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};