import { HttpError } from "./HttpError";

export class StatusNotFoundError extends HttpError {
    constructor(){
        super(404,  "Status not found. (Please specify Resolved, Denied, or Pending)")
    }
}