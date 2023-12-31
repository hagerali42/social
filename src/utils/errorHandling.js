import { ErrorClass } from "./error.Class.js"


export const asyncHandler = (fn) => {
    return (req, res, next) => {
        return fn(req, res, next).catch(error => {
            return next(new ErrorClass(error.message,error.status))
        })
    }
}

export const globalErrorHandling = (error, req, res, next) => {
    return res.status(error.status || 400).json({ msgError: error.message, stack: error.stack })
}

export const notFound = (req, res, next) => {
    const error = new ErrorClass(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};