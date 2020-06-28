
import express, { Request, Response, NextFunction } from 'express'
import { User } from "../models/User"
import { UserIdNaN } from '../errors/User-Id-NaN'
import { authentificationMiddleware } from '../middleware/authentification-middleware'
import { authorizationMiddleware } from '../middleware/authorization-middleware'

export const userRouter = express.Router()

//Use login
userRouter.use(authentificationMiddleware)

//Find Users -- check instructions for authorization persmission
userRouter.get("/", authorizationMiddleware(["Finance-manager"]), (req:Request, res:Response, next:NextFunction)=>{
    res.json(users)
})

//Find Users by ID -- it should let the user with that Id view their own records, but Idk how to get the authorization middleware to work
userRouter.get("/:id", authorizationMiddleware(["Finance-manager"]), (req:Request, res:Response)=>{ //Need specific authorization!
    let {id} = req.params
    if(isNaN(+id)){
        //send a response telling them they need to give us a number
        throw new UserIdNaN
    } else {
        let found = false
        for(const user of users){ //successfully found user
            if (user.userId === +id){
                res.json(user)
                found = true
            }
        }
        if (!found){ //id doesn't exist
            res.status(404).send("user not found")
        }
    }
})


//Update user (need authorization for Admin)
userRouter.patch("/", authorizationMiddleware(["Admin"]), (req:Request, res: Response,) => {
    let id = req.body.userId

    if (!id) {
        throw res.status(404).send("User does not exist!")
    } else if (isNaN(+id)){
        throw new UserIdNaN
    } else {
        let updated = false
        for (const user of users){
            if (user.userId === +id) {
                let username = req.body.username
                let password = req.body.password
                let firstName = req.body.firstName
                let lastName = req.body.lastName
                let email = req.body.email
                let role = req.body.role

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
                res.json(user)
                updated = true
            }
        }
        if (!updated) {
            res.status(404).send("User failed to update")
        }
    }
})


export let users:User[]  = [
    {
    userId: 1, // primary key
    username: "FirstUser", // not null, unique
    password: "Password", // not null
    firstName: "Bob", // not null
    lastName: "Smith", // not null
    email: "bobSmith@email.com", // not null
    role: {
        roleId: 1,
        role: "User"
    } // not null
    }, 

    {
        userId: 2, // primary key
        username: "ManagerMike", // not null, unique
        password: "f4finance", // not null
        firstName: "Michael", // not null
        lastName: "Jones", // not null
        email: "michaelJones@email.com", // not null
        role: {
            roleId: 2,
            role: "Finance-manager"
        } // not null
    },

    {
        userId: 3, // primary key
        username: "AdminAmy", // not null, unique
        password: "UnlimitedPower", // not null
        firstName: "Amy", // not null
        lastName: "Johnson", // not null
        email: "amyJohnson@email.com", // not null
        role: {
            roleId: 3,
            role: "Admin"
        } // not null
    }
]