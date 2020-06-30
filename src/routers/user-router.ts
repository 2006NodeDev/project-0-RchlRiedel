
import express, { Request, Response, NextFunction } from 'express'
import { authentificationMiddleware } from '../middleware/authentification-middleware'
import { authorizationMiddleware } from '../middleware/authorization-middleware'
import { getAllUsers, updateUser, findUsersById } from '../daos/users-dao'
import { User } from '../models/User'
import { UserIdNaN } from '../errors/User-Id-NaN'

export const userRouter = express.Router()

//Use login
userRouter.use(authentificationMiddleware)

//Find Users -- check instructions for authorization persmission
userRouter.get("/", authorizationMiddleware(["Finance-manager", "Admin"]), async (req:Request, res:Response, next:NextFunction)=>{
    try {
        //Let's try not being asynch and see what happens
        let allUsers = await getAllUsers() //thinking in abstraction
        res.json(allUsers)
    } catch(e){
        next(e)
    }})

//Find user by id
userRouter.get("/:userId",  authorizationMiddleware(["Finance-manager", "Admin"]), async (req:Request, res:Response, next:NextFunction)=>{
    let {userId} = req.params
    if(isNaN(+userId)){
        next(new UserIdNaN)
    } else {
        try {
            let user = await findUsersById(+userId)
            res.json(user)
        } catch(e) {
            next(e)
        }
    }
})

//Update user
userRouter.patch("/", authorizationMiddleware(["Admin"]), async (req:Request, res: Response, next:NextFunction) => {
    let {userId, username, password, firstName, lastName, email, role } = req.body

    if (!userId || isNaN(req.body.userId)){
        res.status(400).send('Please provide user Id number')
    } else { //changed because other way (going off of id) was being complicated
        let updatedUser:User = {
            userId,
            username,
            password,
            firstName,
            lastName,
            email,
            role
        }
        updatedUser.username = username || undefined
        updatedUser.password = password || undefined
        updatedUser.firstName = firstName || undefined
        updatedUser.lastName = lastName || undefined
        updatedUser.email = email || undefined
        updatedUser.role = role || undefined

        try {
            let updatedUserResults = await updateUser(updatedUser)
            res.json(updatedUserResults)
        } catch (e) {
            next
        }
    }
})