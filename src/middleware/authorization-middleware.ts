import { Request, Response, NextFunction } from "express";
import { users } from "../routers/user-router";


//same from lightly-burning
export function authorizationMiddleware(roles:string[]){

    return (req: Request, res:Response, next:NextFunction) =>{
        let allowed = false
        for (const user of users){
            if (req.session.user.role.role === user.role.role){
                allowed =true
                console.log(`role: ${user.role.role}, input role:${req.session.user.role.role}`);

                next()
            }
         }
         if (!allowed){ //if they don't have a matching role, kick them out
             res.status(403).send("You have insufficient permissions for this endpoint!")
         }

    }

}

