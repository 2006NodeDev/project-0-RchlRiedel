
import session, { SessionOptions } from 'express-session'

//config object
const sessionConfig:SessionOptions = {
    secret: "secret", 
    cookie:{
        secure:false 
    },
    resave:false,
    saveUninitialized:false
}

//function factory
export const sessionMiddleware = session(sessionConfig) 