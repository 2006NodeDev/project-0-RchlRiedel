import { Request, Response, NextFunction } from "express";


//same from lightly-burning
export function authorizationMiddleware(roles:string[]){

    return (req: Request, res:Response, next:NextFunction) =>{
        let allowed = false
        for (const role of roles){
            if (req.session.user.role.role === role){
                allowed =true
                console.log(`role: ${role}, input role:${req.session.user.role.role}`);

                next()
            }
         }
         if (!allowed){ //if they don't have a matching role, kick them out
             res.status(403).send("You have insufficient permissions for this endpoint!")
         }

    }

}

