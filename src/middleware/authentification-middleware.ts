
import { Request, Response, NextFunction } from "express";

export  function authentificationMiddleware (req:Request, res:Response, next:NextFunction){
    if (!req.session.user){
        res.status(401).send('Please login') //could be a custom error
    } else {
        console.log(`User ${req.session.user.username} has a role of ${req.session.user.role.role}`);
        next()
    }
}
