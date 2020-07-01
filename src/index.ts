
import express, { Request, Response, NextFunction } from "express"
import { userRouter } from "./routers/user-router"
import { reimbursementRouter } from "./routers/reimbursement-router"

import { InvalidCredentials } from "./errors/Invalid-Credentials"
import { getUserByUsernameAndPassword } from "./daos/users-dao"

import { loggingMiddleware } from "./middleware/logging-Middleware"
import { sessionMiddleware } from "./middleware/session-middleware"


const app = express() //out application from express

app.get("/", (req, res) => { 
     res.send("Hello World!")
 })

app.use(express.json()) 

app.use(loggingMiddleware)
app.use(sessionMiddleware)

app.use("/users", userRouter)
app.use("/reimbursements", reimbursementRouter)

app.post("/login", async (req: Request, res: Response, next: NextFunction)=>{
    let {username, password} =  req.body

    if (!username || !password){
        next(new InvalidCredentials())
    } else {
       try {
            let user =await getUserByUsernameAndPassword(username, password)
            req.session.user = user
            res.json(user)
       } catch(e) {
           next(e)
       }
    }
})

//error handler we wrote that express redirects top level errors to
app.use((err, req, res, next) => {
    
    if (err.statusCode) { 
        res.status(err.statusCode).send(err.message)
    } else { //if it wasn't one of our custom errors, send generic response
        console.log(err); 
        res.status(500).send("Oops, something went wrong")
    }
})

app.listen(2007, () => { //start server on port 2007
    console.log("Server has started");
})