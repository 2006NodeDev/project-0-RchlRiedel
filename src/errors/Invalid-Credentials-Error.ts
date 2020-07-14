import { HttpError } from "./Http-Error";

export class InvalidCredentials extends HttpError {
    constructor (){
        super (400, "Invalid credentials")
    }
}