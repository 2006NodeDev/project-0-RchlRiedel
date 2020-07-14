import { Request, Response, NextFunction } from "express";

export function corsFilter(req:Request, res:Response, next: NextFunction){
    //we always have to have the Access Control Allow part to allows stuff
    res.header('Access-Control-Allow-Origin', req.headers.origin) //* is bad because lets any origin send requests; 
    //this is a dirty hack. Don't do this when deploying an app
    res.header('Access-Control-Allow-Headers', 'Orginin, Content-Type, Accept')
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE')

    //the purposed of OPTIONS is to figure out what kind of request are allowed to be made to the server
    //we specify these kinds of requests uing the headers of the response to the options request
    if(req.method === 'OPTIONS'){
        res.sendStatus(200) //will send back the options for the pre flight requests
    } else {
        next() //allow through
    }

}