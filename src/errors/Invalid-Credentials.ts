import { HttpError } from "./HttpError";


export class InvalidCredentials extends HttpError {
    constructor (){
        super (400, "Invalid credentials")
    }
}