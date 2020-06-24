
import { HttpError } from "./HttpError";

export class AuthFailureError extends HttpError {
    constructor (){
        super(401, "Incorrect username or password!")
    }
}
