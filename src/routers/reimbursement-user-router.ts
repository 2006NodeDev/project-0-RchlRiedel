import express, { Request, Response, NextFunction, } from 'express'
import { UserIdNaN } from '../errors/User-Id-NaN'
import { authorizationMiddleware } from '../middleware/authorization-middleware'
import { findReimbursementByAuthor } from '../daos/reimbursements-dao'

export const reimbursementUserRouter = express.Router()

//get reimbursements by user (author)
reimbursementUserRouter.get("/:userId", authorizationMiddleware(["Finance-manager"]), async (req:Request, res:Response ,next: NextFunction)=>{ //Need specific authorization?
    let {userId} = req.params
    if(isNaN(+userId)){
        //send a response telling them they need to give us a number
        next ( new UserIdNaN())
    } else {
       try {
            let reimbursement = await findReimbursementByAuthor(+userId)
            res.json(reimbursement)
       } catch (e) {
           next(e)
       }
    }
})