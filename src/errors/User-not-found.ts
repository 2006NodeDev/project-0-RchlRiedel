import { HttpError } from "./HttpError";

export class UserNotFoundError extends HttpError {
    constructor (){
        super(404, "No user found with that Id")
    }
}