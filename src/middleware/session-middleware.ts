
import session, { SessionOptions } from 'express-session'

//config object
const sessionConfig:SessionOptions = {
    secret: "secret", //FIX WHEN LEARNED ABOUT
    cookie:{
        secure:false 
    },
    resave:false,
    saveUninitialized:false
}


//function factory
export const sessionMiddleware = session(sessionConfig) 