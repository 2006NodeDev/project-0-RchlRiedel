import express, { Request, Response, } from 'express'
import { UserIdNaN } from '../errors/User-Id-NaN'
import { reimbursements } from './reimbursement-router'
import { authorizationMiddleware } from '../middleware/authorization-middleware'

export const reimbursementUserRouter = express.Router()

//get reimbursements by user (author)
reimbursementUserRouter.get("/:userId", authorizationMiddleware(["Finance-manager"]), (req:Request, res:Response)=>{ //Need specific authorization?
    let {userId} = req.params
    if(isNaN(+userId)){
        //send a response telling them they need to give us a number
        throw new UserIdNaN
    } else {
        let found = false
        let user_reimbursements = []; //number of reimbursements the user has made
        for(const reimbursement of reimbursements){ //for each reimbursement
            if (reimbursement.author === +userId){
                user_reimbursements.push(reimbursement)
                found = true
            }
        }

        if (!found){ //id doesn't exist
            res.status(404).send("Author not found")
        } else {
            res.json(user_reimbursements)
        }
    }
})