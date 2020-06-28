
import express, { Request, Response } from "express"
import { userRouter, users } from "./routers/user-router"

import { InvalidCredentials } from "./errors/Invalid-Credentials"
import { AuthFailureError } from "./errors/Authentification-Failure"

import { loggingMiddleware } from "./middleware/logging-Middleware"
import { sessionMiddleware } from "./middleware/session-middleware"
import { reimbursementRouter } from "./routers/reimbursement-router"


const app = express() //call application from express

app.get("/", (req, res) => { 
     res.send("Hello World!")
 })

app.use(express.json()) 

app.use(loggingMiddleware)
app.use(sessionMiddleware)

app.use("/users", userRouter)
app.use("/reimbursements", reimbursementRouter)

app.post("/login", (req:Request, res:Response) => {
//pretty much identical to what is in lightly-burning
    let username = req.body.username
    let password = req.body.password
    
    if (!username || !password){
        throw new InvalidCredentials()
        
    } else {
        let found = false

        for (const user of users) {
            if (user.username === username && user.password === password){
                req.session.user = user
                console.log("Login Successful");
                
                res.json(user)
                found = true
            }
        }
        if (!found) {
            console.log("Login unsuccessful");
            throw new AuthFailureError()
        }
    }

})

//error handler we wrote that express redirects top level errors to
app.use((err, req, res, next) => {
    
    if (err.statusCode) { 
        res.status(err.statusCode).send(err.message)
    } else { //if it wasn't one of our custom errors
        console.log(err); 
        res.status(500).send("Oops, something went wrong") //send generic error response
    }

})


app.listen(2007, () => { //start server on port 2714
    console.log("Server has started");
})