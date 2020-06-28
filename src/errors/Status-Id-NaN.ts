
import { HttpError } from "./HttpError";

//for when trying to retrieve user information by id number

export class StatusIdNaN extends HttpError {
    constructor (){
        super (400, "Status Id must be a number!")
    }
}