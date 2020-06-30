
import express, { Request, Response, NextFunction } from "express"
import { userRouter } from "./routers/user-router"

import { InvalidCredentials } from "./errors/Invalid-Credentials"

import { loggingMiddleware } from "./middleware/logging-Middleware"
import { sessionMiddleware } from "./middleware/session-middleware"
import { reimbursementRouter } from "./routers/reimbursement-router"
import { getUserByUsernameAndPassword } from "./daos/users-dao"


const app = express() //call application from express

app.get("/", (req, res) => { 
     res.send("Hello World!")
 })

app.use(express.json()) 

app.use(loggingMiddleware)
app.use(sessionMiddleware)

app.use("/users", userRouter)
app.use("/reimbursements", reimbursementRouter)

app.post("/login", async (req: Request, res: Response, next: NextFunction)=>{
    //the bady/less efficient way. Could use decnstructing instead (see ./routers/book-router)
    let username = req.body.username 
    let password = req.body.password
    //if I didn't get a username or password, need error to give me both fields
    if (!username || !password){
        throw new InvalidCredentials() 
    } else {
       try {
            let user =await getUserByUsernameAndPassword(username, password)
            req.session.user = user
            res.json(user)
       } catch(e) {
           next(e)
       }
    }
    //must also make sure they are valid
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