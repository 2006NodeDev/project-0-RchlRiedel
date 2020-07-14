import { HttpError } from "./Http-Error";

export class RoleNotFoundError extends HttpError {
    constructor(){
        super(404,  "Role not found.")
    }
}