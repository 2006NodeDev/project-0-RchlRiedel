import { HttpError } from "./HttpError";

export class RoleNotFoundError extends HttpError {
    constructor(){
        super(404,  "Role not found.")
    }
}