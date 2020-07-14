//import { Role } from "./Role";

//The User model keeps track of users information.

export class User {
    userId: number; // primary key
    username: string; // not null, unique
    password: string; // not null
    firstName: string; // not null
    lastName: string; // not null
    email: string; // not null
    role: String // not null
  }