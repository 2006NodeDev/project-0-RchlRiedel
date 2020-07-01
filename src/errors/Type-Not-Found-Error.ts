import { HttpError } from "./HttpError";

export class TypeNotFoundError extends HttpError {
    constructor(){
        super(404, "Type not found. (Please specify Provisions, Transportation, Weapons and Armor, or Miscellaneous)")
    }
}