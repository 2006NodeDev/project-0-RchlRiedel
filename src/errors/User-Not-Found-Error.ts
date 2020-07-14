import { HttpError } from "./Http-Error";

export class UserNotFoundError extends HttpError {
    constructor(){
        super(404,  "User not found.")
    }
}