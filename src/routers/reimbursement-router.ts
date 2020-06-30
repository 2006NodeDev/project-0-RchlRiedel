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
reimbursementRouter.get("/", authorizationMiddleware(["Finance-manager"]), async (req:Request, res:Response, next:NextFunction)=>{
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
    let {amount, description, type} = req.body 
    let author = req.session.user.userId

    if (!author || !amount || !description ){
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
    let {reimbursementId, author, amount, dateSubmitted, dateResolved, description, resolver, status, type } = req.body
    
    if (!reimbursementId || isNaN(reimbursementId)) {
            res.status(400).send("Please provide reimbursement Id number")
    } else if (status === "Approved" || status === "Denied") {
        let updatedReimbursement:Reimbursement = {
            reimbursementId,
            author,
            amount,
            dateSubmitted,
            dateResolved: new Date(),
            description,
            resolver: req.session.user.userId,
            status:1,
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
            dateSubmitted,
            dateResolved,
            description,
            resolver,
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
    }
})