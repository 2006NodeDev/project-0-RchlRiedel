
import express, { Request, Response, NextFunction } from 'express'
import { authentificationMiddleware } from '../middleware/authentification-middleware'
import { authorizationMiddleware } from '../middleware/authorization-middleware'
import { getAllUsers, updateUser, findUsersById } from '../daos/users-dao'

export const userRouter = express.Router()

//Use login
userRouter.use(authentificationMiddleware)

//Find Users -- check instructions for authorization persmission
userRouter.get("/", authorizationMiddleware(["Finance-manager"]), async (req:Request, res:Response, next:NextFunction)=>{
    try {
        //Let's try not being asynch and see what happens
        let allUsers = await getAllUsers() //thinking in abstraction
        res.json(allUsers)
    } catch(e){
        next(e)
    }})

//Find user by id
userRouter.get("/:id",  authorizationMiddleware(["Finance-manager"]), async (req:Request, res:Response, next:NextFunction)=>{
    let {id} = req.params
    if(isNaN(+id)){
        res.status(400).send("Id needs to be a number")
    } else {
        try {
            let user = await findUsersById(+id)
            res.json(user)
        } catch(e) {
            next(e)
        }
    }
})

//Update user
userRouter.patch("/", authorizationMiddleware(["Admin"]), async (req:Request, res: Response, next:NextFunction) => {
    let {userId} = req.body 

    if (!userId || isNaN(req.body.userId)){
        res.status(400).send('Please provide user Id number')
    } else {
        let user = await findUsersById(+userId); //pull up the user we wish to update

        let username = req.body.username
        let password = req.body.password
        let firstName = req.body.firstName
        let lastName = req.body.lastName
        let email = req.body.email
        let role = req.body.role
        //defining variables based on body, then (if they exist) updating the user
        if(username){
            user.username = username
        }
        if(password){
            user.password = password
        }
        if(firstName){
            user.firstName = firstName
        }
        if(lastName){
            user.lastName = lastName
        }
        if(email){
            user.email = email
        }
        if (role){ //This should be a string, but it must affect the id
            user.role = role
        }
        try {
            let updatedUser = await updateUser(user)
            res.json(updatedUser)
        } catch (e) {
            next
        }
    }
})