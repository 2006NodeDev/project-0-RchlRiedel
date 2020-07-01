import express, { Request, Response, NextFunction, } from 'express'
import { Reimbursement } from '../models/Reimbursement'
import {reimbursementUserRouter } from './reimbursement-user-router'
import { reimbursementStatusRouter } from './reimbursement-status-router'
import { authorizationMiddleware } from '../middleware/authorization-middleware'
import { ReimbursementInputError } from '../errors/Reimbursement-Input-Error'
import { getAllReimbursements, saveOneReimbursement, updateReimbursement } from '../daos/reimbursements-dao'

export const reimbursementRouter = express.Router()

//find by user
reimbursementRouter.use("/author/userId", reimbursementUserRouter)

//find by status
reimbursementRouter.use("/status", reimbursementStatusRouter)

//find all -- useful to check if submitting and updating work
reimbursementRouter.get("/", authorizationMiddleware(["Finance-manager"], false), async (req:Request, res:Response, next:NextFunction)=>{
    try {
        let allReimbursements = await getAllReimbursements()
        res.json(allReimbursements)
    } catch (e) {
        next(e)
    }
})

//submit new 
reimbursementRouter.post("/", async (req:Request, res: Response, next: NextFunction) => {
    
    let {amount, description, type} = req.body 
    let author = req.session.user.userId

    if (!author || !amount || !description || !type ){
        next(new ReimbursementInputError)
    } else {
        let newReimbursement: Reimbursement = {
            reimbursementId:0, 
            author, 
            amount, 
            dateSubmitted: new Date(), 
            dateResolved: null, 
            description, 
            resolver: null, 
            status:3, 
            type
        }

        try {
            let savedReimbrusement = await saveOneReimbursement(newReimbursement)
            res.json(savedReimbrusement) 
        } catch(e) {
            next(e)
        }
    }   
})

//update existing
reimbursementRouter.patch("/", authorizationMiddleware(["Finance-manager"], false), async (req:Request, res: Response, next: NextFunction) => {
    let {reimbursementId, author, amount, description, status, type } = req.body
    
    if (!reimbursementId || isNaN(reimbursementId) ) {
            res.status(400).send("Please provide reimbursement Id number")
    } 
    if (status === "Approved" || status === "Denied") {
        let updatedReimbursement:Reimbursement = {
            reimbursementId,
            author,
            amount,
            dateSubmitted: undefined,
            dateResolved: new Date(),
            description,
            resolver: req.session.user.userId,
            status,
            type
        }
        updatedReimbursement.author = author || undefined
        updatedReimbursement.amount = amount || undefined
        updatedReimbursement.description = description || undefined      
        updatedReimbursement.status = status || undefined
        updatedReimbursement.type = type || undefined

        try {
            let updatedReimbursementResults = await updateReimbursement(updatedReimbursement)
            res.json(updatedReimbursementResults)
        } catch (e) {
            next(e)
        }
    } else {
        let updatedReimbursement:Reimbursement = {
            reimbursementId,
            author,
            amount,
            dateSubmitted: undefined,
            dateResolved: null,
            description,
            resolver: null,
            status:3,
            type
        }
        updatedReimbursement.author = author || undefined
        updatedReimbursement.amount = amount || undefined
        updatedReimbursement.description = description || undefined      
        updatedReimbursement.status = status || undefined
        updatedReimbursement.type = type || undefined

        try {
            let updatedReimbursementResults = await updateReimbursement(updatedReimbursement)
            res.json(updatedReimbursementResults)
        } catch (e) {
            next(e)
        }
    }
})