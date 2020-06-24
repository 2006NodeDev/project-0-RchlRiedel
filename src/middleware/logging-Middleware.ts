import { Request, Response, NextFunction } from "express";

//same as lightly-burning
//when someone sends us a request, we want to log where they sent it from and what kind of a request they sent

export function loggingMiddleware(req:Request, res:Response, next:NextFunction){
    console.log(`${req.method} Request from ${req.ip} to ${req.path}`);
    next() //tells function to move on to next matching piece of middleware
}