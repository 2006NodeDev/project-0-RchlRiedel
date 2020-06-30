
import express, { Request, Response, NextFunction, } from 'express'
import { StatusIdNaN } from '../errors/Status-Id-NaN'
import { authorizationMiddleware } from '../middleware/authorization-middleware'
import { findReimbursementByStatus } from '../daos/reimbursements-dao'

export const reimbursementStatusRouter = express.Router()

//get reimbursements based on status id
reimbursementStatusRouter.get("/:statusId", authorizationMiddleware(["Finance-manager"]), async (req:Request, res:Response, next: NextFunction)=>{ //Need specific authorization?
    let {statusId} = req.params
    if(isNaN(+statusId)){
        //send a response telling them they need to give us a number
        throw new StatusIdNaN
    } else {
        try {
            let reimbursement = await findReimbursementByStatus(+statusId)
            res.json(reimbursement)
       } catch (e) {
           next(e)
       }
    }
})