
import { HttpError } from "./HttpError";

//for when trying to retrieve user information by id number

export class StatusIdNaN extends HttpError {
    constructor (){
        super (400, "Status id must be a number!")
    }
}