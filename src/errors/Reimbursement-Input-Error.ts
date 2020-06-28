import { HttpError } from "./HttpError";

//specific implementation of HttpError
export class ReimbursementInputError extends HttpError {

    constructor(){
        super(400, "Please fill out all reimbursement fields")
    }

}

