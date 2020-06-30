import { HttpError } from "./HttpError";

//specific implementation of HttpError
export class ReimbursementInputError extends HttpError {

    constructor(){
        super(400, "Please include the required reimbursement fields")
    }

}

