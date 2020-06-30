import { Request, Response, NextFunction } from "express";


//same from lightly-burning
export function authorizationMiddleware(roles:string[], userId?: boolean){ //get the roles, or see if they have an id

    return (req: Request, res:Response, next:NextFunction) =>{
        let allowed = false
            //to allow a given role
        for (const role of roles){
            if (req.session.user.role.role === role){
                allowed =true
                console.log(`role: ${role}, input role:${req.session.user.role.role}`);
            }
        }
        if (userId){ 
            let id = +req.params.userId //get the id from path
            if (!isNaN(id)){
                if (req.session.user.userId === id) { //watch for type coersion
                    allowed = true
                }
            }
        }
         if (allowed) { //have to wait to make sure both conditions are checked
            next() 
         } else { 
             //if they don't have a matching role or the right id, kick them out
             res.status(403).send("You have insufficient permissions for this endpoint!")
         }

    }

}

