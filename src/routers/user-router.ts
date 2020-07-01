
import express, { Request, Response, NextFunction } from 'express'
import { authentificationMiddleware } from '../middleware/authentification-middleware'
import { authorizationMiddleware } from '../middleware/authorization-middleware'
import { getAllUsers, updateUser, findUsersById } from '../daos/users-dao'
import { User } from '../models/User'
import { UserIdNumberNeededError } from '../errors/User-Id-Number-Needed-Error'

export const userRouter = express.Router()

//Use login
userRouter.use(authentificationMiddleware)

//Find Users 
userRouter.get("/", authorizationMiddleware(["Finance-manager", "Admin"], false), async (req:Request, res:Response, next:NextFunction)=>{
    try {
        let allUsers = await getAllUsers() 
        res.json(allUsers)
    } catch(e){
        next(e)
    }})

//Find user by id
userRouter.get("/:userId",  authorizationMiddleware(["Finance-manager", "Admin"], true), async (req:Request, res:Response, next:NextFunction)=>{
    let {userId} = req.params
    if(isNaN(+userId)){
        next(new UserIdNumberNeededError)
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
userRouter.patch("/", authorizationMiddleware(["Admin"], false), async (req:Request, res: Response, next:NextFunction) => {
    let {userId, username, password, firstName, lastName, email, role } = req.body

    if (!userId || isNaN(req.body.userId)){
        next (new UserIdNumberNeededError)
    } else { 
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