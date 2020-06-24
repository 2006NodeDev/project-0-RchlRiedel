
import express, { Request, Response, NextFunction, } from 'express'
import { User } from "../models/User"
import { UserIdNaN } from '../errors/User-Id-NaN'
import { authentificationMiddleware } from '../middleware/authentification-middleware'
import { authorizationMiddleware } from '../middleware/authorization-middleware'

export const userRouter = express.Router()

//Use login
userRouter.use(authentificationMiddleware)

//Find Users -- check instructions for authorization persmission
userRouter.get("/", authorizationMiddleware(["Admin", "Finance-manager"]), (req:Request, res:Response, next:NextFunction)=>{
    res.json(users)
})

//Find Users by ID
userRouter.get("/:id", authorizationMiddleware(["Admin"]), (req:Request, res:Response)=>{ //Need specific authorization!
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


//Update user

//Use reimbursement router for all others







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
        username: "AmdinAmy", // not null, unique
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