
import express, { Request, Response, } from 'express'
import { reimbursements } from './reimbursement-router'
import { StatusIdNaN } from '../errors/Status-Id-NaN'
import { authorizationMiddleware } from '../middleware/authorization-middleware'

export const reimbursementStatusRouter = express.Router()

//get reimbursements based on status id
reimbursementStatusRouter.get("/:statusId", authorizationMiddleware(["Finance-manager"]), (req:Request, res:Response)=>{ //Need specific authorization?
    let {statusId} = req.params
    if(isNaN(+statusId)){
        //send a response telling them they need to give us a number
        throw new StatusIdNaN
    } else {
        let found = false
        let status_reimbursements = []; //number of reimbursements with status
        for(const reimbursement of reimbursements){ //for each reimbursement, add to list
            if (reimbursement.status === +statusId){
                status_reimbursements.push(reimbursement)
                found = true
            }
        }
        if (!found){ //id doesn't exist
            res.status(404).send("No reimbursements have that status")
        } else {
            res.json(status_reimbursements)
        }
    }
})