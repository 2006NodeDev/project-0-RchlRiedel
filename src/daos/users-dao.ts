import { PoolClient, QueryResult } from "pg";
import { connectionPool } from ".";
import { UserDTOtoUserConverter } from "../utilities/UserDTO-to-Users-converter";
import { User } from "../models/User";
import { UserNotFoundError } from "../errors/User-Not-Found-Error";
import { AuthFailureError } from "../errors/Authentification-Failure";
import { RoleNotFoundError } from "../errors/Role-Not-Found-Error";

export async function getAllUsers(): Promise<User[]>{
    //first, decleare a client
    let client:PoolClient
    try {
        //get connection
        client = await connectionPool.connect()
        //send query
        let results = await client.query(`select u.user_id, u.username, u."password", u.first_name, u.last_name, u.email, r."role", r.role_id from project_0.users	u 
                            left join project_0.roles r on u."role" = r."role_id";`)
        //return results
        return results.rows.map(UserDTOtoUserConverter)
    } catch(e) {
        //if we get an error we don't know
        console.log(e);
        throw new Error ("This error can't be handled, like the way the ring can't be handled by anyone but Frodo")
    } finally {
        //let the connection go back to the pool
        client && client.release()
    }
}

//find users by id
export async function findUsersById (userId: number): Promise<User> {
    let client: PoolClient 
    try{ 
        client = await connectionPool.connect()
        let results: QueryResult = await client.query(`select u.user_id, u.username, u."password", u.first_name, u.last_name, u.email, r."role", r.role_id from project_0.users u 
                                                    left join project_0.roles r on u."role" = r."role_id" 
                                                    where u.user_id = $1;`, [userId])
        if (results.rowCount === 0){
            throw new Error('NotFound')
        } else {
            return UserDTOtoUserConverter(results.rows[0])
        }
    } catch(e) {
        if (e.message === "NotFound"){
            throw new UserNotFoundError
        }
        console.log(e);
        throw new Error ("This error can't be handled, like the way the ring can't be handled by anyone but Frodo")
    } finally { 
        client && client.release()
    }
}

//update a user info
export async function updateUser (updatedUser:User): Promise <User> {
    let client: PoolClient

    try {
        client = await connectionPool.connect()
        await client.query('BEGIN;') //start transaction

        if (updatedUser.username){
            await client.query(`update project_0.users set username = $1 where user_id = $2;`,
                                [updatedUser.username, updatedUser.userId])
        }
        if (updatedUser.password){
            await client.query(`update project_0.users set "password" = $1 where user_id = $2;`,
                                [updatedUser.password, updatedUser.userId])
        } 
        if (updatedUser.firstName){
            await client.query(`update project_0.users set first_name = $1 where user_id = $2;`,
                                [updatedUser.firstName, updatedUser.userId])
        } 
        if (updatedUser.lastName){
            await client.query(`update project_0.users set last_name = $1 where user_id = $2;`,
                                [updatedUser.lastName, updatedUser.userId])
        } 
        if (updatedUser.email){
            await client.query(`update project_0.users set email = $1 where user_id = $2;`,
                                [updatedUser.email, updatedUser.userId])
        }
        if (updatedUser.role){
            let roleId = await client.query(`select r.role_id from project_0.roles r where r."role" = $1;`, [updatedUser.role])
            if (roleId.rowCount === 0 ){ //if role not found
                throw new Error("Role Not Found")
            }
            roleId = roleId.rows[0].role_id 
            await client.query(`update project_0.users set "role" = $1 where user_id = $2;`,
                                [roleId, updatedUser.userId])
        } 

        await client.query('COMMIT;') //end transaction
        return findUsersById(updatedUser.userId)

    } catch(e) {
        client && client.query('ROLLBACK;') //if a js error takes place, send it back
        if (e.message === "Role Note Found"){
            throw new RoleNotFoundError
        }
        console.log(e);
        throw new Error ("This error can't be handled, like the way the ring can't be handled by anyone but Frodo")
    } finally {
        client && client.release()
    }
}

//For login
export async function getUserByUsernameAndPassword (username:String, password:String): Promise<User>{
    let client: PoolClient 
    try{ 
        client = await connectionPool.connect()
        let results: QueryResult = await client.query(`select u.user_id, u.username, u."password", u.first_name, u.last_name, u.email, r."role", r.role_id from project_0.users u 
                                                    left join project_0.roles r on u."role" = r."role_id" 
                                                    where u.username = $1 and u.password = $2;`, [username, password])      
        if (results.rowCount === 0){
            throw new Error("NotFound")
        } 
        return UserDTOtoUserConverter(results.rows[0]) 
    } catch(e) {
        if (e.message === "NotFound"){
            throw new AuthFailureError
        }
        console.log(e);
        throw new Error ("This error can't be handled, like the way the ring can't be handled by anyone but Frodo")
    } finally { 
        client && client.release()
    }
}
