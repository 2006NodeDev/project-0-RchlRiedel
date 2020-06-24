
import { HttpError } from "./HttpError";

//for when trying to retrieve user information by id number

export class UserIdNaN extends HttpError {
    constructor (){
        super (400, "Id must be a number!")
    }
}