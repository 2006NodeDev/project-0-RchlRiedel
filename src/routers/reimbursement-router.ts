import express, { Request, Response, NextFunction, } from 'express'
import { Reimbursement } from '../models/Reimbursement'
import {reimbursementUserRouter } from './reimbursement-user'
import { reimbursementStatusRouter } from './reimbursement-status'
import { authorizationMiddleware } from '../middleware/authorization-middleware'
import { ReimbursementInputError } from '../errors/Reimbursement-Input-Error'

export const reimbursementRouter = express.Router()

//find by user
reimbursementRouter.use("/author/userId", reimbursementUserRouter)

//find by status
reimbursementRouter.use("/status", reimbursementStatusRouter)

//find all -- useful to check if submitting and updating work
reimbursementRouter.get("/", (req:Request, res:Response, next:NextFunction)=>{
    res.json(reimbursements)
})

//submit new 
reimbursementRouter.post("/", (req:Request, res: Response,) => {
    let { reimbursementId,
        author,
        amount, 
        dateSubmitted,  
        dateResolved,
        description,
        resolver, 
        status, 
        type
    } = req.body 

    if (reimbursementId && author && amount && dateSubmitted && dateResolved && description && resolver && status && type){
        //Don't need this once database in place:
        reimbursements.push({reimbursementId,author,amount,dateSubmitted,dateResolved,description,resolver,status,type})
        res.sendStatus(201)
    } else {
        throw new ReimbursementInputError()
    }
})


//update existing
reimbursementRouter.patch("/",  authorizationMiddleware(["Finance-manager"]), (req:Request, res: Response,) => {
    let id = req.body.reimbursementId

    if (!id) {
        throw res.status(404).send("Reimbursement does not exist!")
    } else if (isNaN(+id)){
        throw res.status(404).send("Reimbursement id provided is not a number!")
    } else {
        let updated = false
        for (const reimbursement of reimbursements){
            if (reimbursement.reimbursementId === +id) {
                let author = req.body.author 
                let amount = req.body.amount 
                let dateSubmitted = req.body.dateSubmitted  
                let dateResolved = req.body.dateResolved
                let description = req.body.description
                let resolver = req.body.resolver 
                let status = req.body.status // Link status name with Id
                let type = req.body.type //Link between type name and id

                if(author){ //Figure out Id vs name
                    reimbursement.author = author
                }
                if(amount){
                    reimbursement.amount = amount
                }
                if(dateSubmitted){
                    reimbursement.dateSubmitted = dateSubmitted
                }
                if(dateResolved){
                    reimbursement.dateResolved = dateResolved
                }
                if(description){
                    reimbursement.description = description
                }
                if (resolver){ //Figure out Id vs name
                    reimbursement.resolver = resolver
                }
                if (status){ //Figure out Id vs name
                    reimbursement.status = status
                }
                if (type){ //Figure out Id vs name
                    reimbursement.type = type
                }
                res.json(reimbursement)
                updated = true
            }
        }
        if (!updated) {
            res.status(404).send("Reimbursement failed to update")
        }
    }
})


//fake data
export let reimbursements:Reimbursement[] = [
    {
        reimbursementId: 1, // primary key
        author: 1,  // foreign key -> User, not null
        amount: 2334,  // not null
        dateSubmitted: 1111, // not null  
        dateResolved: 1112, // not null
        description: "Potatoes", // not null
        resolver: 2, // foreign key -> User
        status: 2, // foreign key -> ReimbursementStatus, not null
        type: 3 // foreign key -> ReimbursementType
    },

    {
        reimbursementId: 2, // primary key
        author: 1,  // foreign key -> User, not null
        amount: 9876,  // not null
        dateSubmitted: 2222, // not null  
        dateResolved: 2223, // not null
        description: "Lembas bread", // not null
        resolver: 2, // foreign key -> User
        status: 1, // foreign key -> ReimbursementStatus, not null
        type: 3 // foreign key -> ReimbursementType
    }



]