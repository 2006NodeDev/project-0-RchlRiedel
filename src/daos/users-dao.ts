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
        let results = await client.query(`select u.user_id, u.username, u."password", u.first_name, u_last_name, u.email, r."role", r.role_id from project_0.users	u 
                            left join project_0.roles r on u."role" = r."role_id" ;`)
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
export async function findUsersById (id: number): Promise<User> {
    let client: PoolClient 
    try{ 
        client = await connectionPool.connect()
        let results: QueryResult = await client.query(`select u.user_id, u.username, u."password", u.first_name, u.last_name, u.email, r."role", r.role_id from project_0.users u 
                                                    left join project_0.roles r on u."role" = r."role_id" 
                                                    where u.user_id = $1;`, [id])
        if (results.rowCount === 0){
            throw new Error('NotFound')
        } else {
            return UserDTOtoUserConverter(results.rows[0])
        }
    } catch(e) {
        if (e.message === "NotFound"){
            throw new UserNotFoundError()
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

        let results = await client.query(`update project_0.users u
                                            set u.username = $1, u."password"=$2, u.first_name=$3, u.last_name=$4, u.email=$5, u.role=$6
                                            where u.user_id = $7`, 
                                            [updatedUser.username, updatedUser.password, updatedUser.firstName, updatedUser.lastName, updatedUser.email, updatedUser.role.roleId, updatedUser.userId])

        if (results.rowCount === 0){
            throw new Error('NotFound')
        } else {
            return findUsersById(updatedUser.userId)
        }

    } catch(e) {
        if (e.message === "NotFound"){
            throw new UserNotFoundError()
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
        let results: QueryResult = await client.query(`select u.user_id, u.username, u."password", u.first_name, u.last_name u.email, r."role", r.role_id from project_0.users u 
                                                    left join project_0.roles r on u."role" = r."role_id" 
                                                    where u.username = $1 and u.password = $2;`, [username, password])      
        if (results.rowCount === 0){
            throw new Error('NotFound')
        } 
        return UserDTOtoUserConverter(results.rows[0]) 
    } catch(e) {
        if (e.message === "NotFound"){
            throw new AuthFailureError()
        }
        console.log(e);
        throw new Error ("This error can't be handled, like the way the ring can't be handled by anyone but Frodo")
    } finally { 
        client && client.release()
    }
}
