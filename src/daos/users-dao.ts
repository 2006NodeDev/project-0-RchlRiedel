import { PoolClient, QueryResult } from "pg";
import { connectionPool } from ".";
import { UserDTOtoUserConverter } from "../utilities/UserDTO-to-Users-converter";
import { User } from "../models/User";
import { UserNotFoundError } from "../errors/User-not-found";
import { AuthFailureError } from "../errors/Authentification-Failure";

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
        let roleId = await client.query(`select r.role_id from project_0.roles r where r."role" = $1`, [updatedUser.role])
        if (roleId.rowCount === 0 ){ //if role not found
            throw new Error("Role Not Found")
        }
        roleId = roleId.rows[0].role_id 
        let results = await client.query(`update project_0.users
                                            set username = $1, "password"=$2, first_name=$3, last_name=$4, email=$5, role=$6
                                            where user_id = $7;`, 
                                            [updatedUser.username, updatedUser.password, updatedUser.firstName, updatedUser.lastName, updatedUser.email, roleId, updatedUser.userId])
        await client.query('COMMIT;') //end transaction
        if (results.rowCount === 0){
            throw new Error('NotFound')
        } else {
            return findUsersById(updatedUser.userId) //not sure this will workkkkkkkkkkkkkkkkkkkkkkkk
        }

    } catch(e) {
        client && client.query('ROLLBACK;') //if a js error takes place
        if (e.message === "NotFound"){
            throw new UserNotFoundError
        }
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
