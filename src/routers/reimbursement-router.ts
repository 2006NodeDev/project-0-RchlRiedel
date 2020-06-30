import express, { Request, Response, NextFunction, } from 'express'
import { Reimbursement } from '../models/Reimbursement'
import {reimbursementUserRouter } from './reimbursement-user-router'
import { reimbursementStatusRouter } from './reimbursement-status-router'
import { authorizationMiddleware } from '../middleware/authorization-middleware'
import { ReimbursementInputError } from '../errors/Reimbursement-Input-Error'
import { getAllReimbursements, saveOneReimbursement, updateReimbursement, findReimbursementById } from '../daos/reimbursements-dao'

export const reimbursementRouter = express.Router()

//find by user
reimbursementRouter.use("/author/userId", reimbursementUserRouter)

//find by status
reimbursementRouter.use("/status", reimbursementStatusRouter)

//find all -- useful to check if submitting and updating work
reimbursementRouter.get("/", async (req:Request, res:Response, next:NextFunction)=>{
    try {
        let allReimbursements = await getAllReimbursements()
        res.json(allReimbursements)
    } catch (e) {
        next(e)
    }
})

//submit new 
reimbursementRouter.post("/", async (req:Request, res: Response, next: NextFunction) => {
    console.log(req.body) //check the req body
    let {author, amount, dateSubmitted, description, type} = req.body 
    
    if (!author || !amount || !dateSubmitted || !description ){
        throw new ReimbursementInputError()
    } else {
        let newReimbursement: Reimbursement = {
            reimbursementId:0, author, amount, dateSubmitted: new Date(), dateResolved: null, description, resolver: null, status:3, type
        }
        newReimbursement.type = type || null

        try {
            let savedReimbrusement = await saveOneReimbursement(newReimbursement)
            res.json(savedReimbrusement) //must send back after assigning userID
        } catch(e) {
            next(e)
        }
    }   
})


//update existing
reimbursementRouter.patch("/", authorizationMiddleware(["Finance-manager"]), async (req:Request, res: Response, next: NextFunction) => {
    let {reimbursementId } = req.body
    
    if (!reimbursementId || isNaN(reimbursementId)) {
            res.status(400).send("Please provide reimbursement Id number")
    } else {
        let reimbursement = await findReimbursementById(+reimbursementId)
        
        let author = req.body.author
        let amount = req.body.amount
        let dateSubmitted = req.body.dateSubmitted
        let dateResolved = req.body.dateResolved
        let description = req.body.description        
        let resolver = req.body.resolver 
        let type = req.body.type 

        if (author) {
            reimbursement.author = author
        } if (amount) {
            reimbursement.amount = amount
        }  if (dateSubmitted) {
            reimbursement.dateSubmitted = dateSubmitted
        }  if (dateResolved) {
            reimbursement.dateResolved = dateResolved
        }  if (description) {
            reimbursement.description = description
        }  if (resolver) {
            reimbursement.resolver = resolver
        }  if (type) {
            reimbursement.type = type
        }  
        try {
            let updatedReimbursement = await updateReimbursement(reimbursement)
            res.json(updatedReimbursement)
        } catch (e) {
            next(e)
        }
    }
})