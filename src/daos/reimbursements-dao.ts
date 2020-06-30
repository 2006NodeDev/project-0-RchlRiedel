import { PoolClient, QueryResult } from "pg";
import { connectionPool } from ".";
import { ReimbursementNotFoundError } from "../errors/Reimbursement-Not-Found";
import { ReimbursementDTOtoReimbursementConverter } from "../utilities/ReimbursementDTO-to-Reimbursement-converter";
import { Reimbursement } from "../models/Reimbursement";
import { ReimbursementInputError } from "../errors/Reimbursement-Input-Error";

//get all reimbursements
export async function getAllReimbursements(): Promise<Reimbursement[]>{
    //this will be the "connectio" we borrow from the bool but that process can take some time and/or fail so we declare that var ahead of time
    let client: PoolClient 
    try{
        client = await connectionPool.connect() //using template literal below to sapce out nicer
        let results:QueryResult = await client.query(`select * from project_0.reimbursements r 
                                                        left join  project_0.users u on r.author = u.user_id
                                                        left join project_0.reimbursement_status rs on r.status = rs.status_id 
                                                        left join project_0.reimbursement_type rt on r."type" = rt.type_id
                                                        order by r.date_submitted;`) 
        return results.rows.map(ReimbursementDTOtoReimbursementConverter) 
    } catch(e){
        console.log(e);
        throw new Error("This error can't be handled, like the way the ring can't be handled by anyone but Frodo") 
        //technically "hasn't been handled" is more accurate but I wanted to make a reference
    } finally {
        //we make sure client isn't undefined using gaurd
        client && client.release() 

    }
}

//get reimbursement by id
export async function findReimbursementById (reimbursementId:number): Promise<Reimbursement> {
    let client: PoolClient
    try {
        client = await connectionPool.connect()
        let results: QueryResult = await client.query(`select * from project_0.reimbursements r 
                                                        left join  project_0.users u on r.author = u.user_id
                                                        left join project_0.reimbursement_status rs on r.status = rs.status_id 
                                                        left join project_0.reimbursement_type rt on r."type" = rt.type_id
                                                        where r.reimbursement_id = $1
                                                        order by r.date_submitted;`, [reimbursementId])
        if (results.rowCount === 0){
            throw new Error ("NotFound")
        } else {
            return ReimbursementDTOtoReimbursementConverter(results.rows[0])
        }
    } catch (e) {
        if (e.message === "Not Found") {
            throw new ReimbursementNotFoundError
        }
        throw new Error ("This error can't be handled, like the way the ring can't be handled by anyone but Frodo")
    } finally { 
        client && client.release()
    }
}

//save a new reimbursement 
export async function saveOneReimbursement(newReimbursement: Reimbursement): Promise <Reimbursement> {
    let client: PoolClient

    try{
        client = await connectionPool.connect()
        await client.query('BEGIN;') //add a transaction
        //we are letting users input the type, not the type id that is needed for reimbursement
        //thus, we must "convert" using the reimbursement_type table
        let typeId = await client.query(`select rt.type_id from project_0.reimbursement_type rt 
                                        where rt."type" = $1;`, [newReimbursement.type])
        if (typeId.rowCount === 0 && newReimbursement.type !== null){ //if type not found, but it can be null
            throw new Error("Type Not Found. (Please specify Provisions, Transportation, Weapons and Armor, or Msicellaneous)")
        }
        typeId = typeId.rows[0].type_id //get the type id number given the string of type
        
        //authorId, statusId, and other things are all specified in router, so we don't need to "convert"

        let results = await client.query(`insert into project_0.reimbursements ("author", "amount", "date_submitted", "date_resolved", "description", "resolver", "status", "type")
                                            values ($1,$2,$3,$4,$5,$6,$7,$8) returning reimbursement_id`, 
                                            [newReimbursement.author, newReimbursement.amount, newReimbursement.dateSubmitted, newReimbursement.dateResolved, 
                                            newReimbursement.description, newReimbursement.resolver, newReimbursement.status, typeId])
        newReimbursement.reimbursementId = results.rows[0].reimbursement_id
        //edit so that status is shown
        await client.query('COMMIT;') //end transaction
        return ReimbursementDTOtoReimbursementConverter(results.rows[0])

    } catch(e) {
        client && client.query('ROLLBACK;') //if a js error takes place, send it back
        if (e.message === "Type Not Found. (Please specify Provisions, Transportation, Weapons and Armor, or Msicellaneous)"){
            throw new ReimbursementInputError
        }
        console.log(e);
        throw new Error ("This error can't be handled, like the way the ring can't be handled by anyone but Frodo")
    } finally {
        client && client.release()
    }
}

//update a reimbursement 
export async function updateReimbursement (updatedReimbursement:Reimbursement): Promise <Reimbursement> {
    let client: PoolClient

    try {
        client = await connectionPool.connect()

        await client.query('BEGIN;') 

        //get the type id number given the string of type
        let typeId = await client.query(`select rt.type_id from project_0.reimbursement_type rt 
                                        where rt."type" = $1;`, [updatedReimbursement.type])
        if ( updatedReimbursement.type > 0 || updatedReimbursement.type < 5){ //if type not found, but it can be null
            typeId = typeId.rows[0].type_id 
        } else if (updatedReimbursement.type === null || updatedReimbursement.type === undefined){
            typeId = null;
        } else {
            console.log(updatedReimbursement.type);
            throw new Error("Type Not Found. (Please specify Provisions, Transportation, Weapons and Armor, or Msicellaneous)")

        }
        //get the status id number given the string of status
        let statusId = await client.query(`select rs.status.id from project_0.reimbursement_status rs 
                                        where rs."status" = $1;`, [updatedReimbursement.status])
        if (statusId.rowCount === 0){ 
            throw new Error("Status Not Found. (Please specify Resolved, Denied, or Pending)")
        }
        statusId = statusId.rows[0].status_id 

        // //get the author user id given the string of author
        // let authorId = await client.query(`select u.user_id from project_0.users u 
        //                                     where u.user_id = $1`, [updatedReimbursement.author])
        // if (authorId.rowCount === 0){
        //     throw new Error ("Author listed does not exist as user")
        // }
        // authorId = authorId.rows[0].user_id
        //we don't need one of these things for resolver, since it should only be updated when status changed, and then it will always be req.session.user.userId

        let results = await client.query(`update project_0.reimbursements
                                        set author = $1, amount = $2, date_resolved = $4, description = $5, resolver = $6, status = $7, type = $8
                                        where reimbursement_id = $7 returning reimbursement_id;`,  
                                            [updatedReimbursement.author, updatedReimbursement.amount, updatedReimbursement.dateResolved, updatedReimbursement.description, 
                                                updatedReimbursement.resolver, statusId, typeId, updatedReimbursement.reimbursementId]) 
                                            //hote this works with the resolved conditional
        await client.query('COMMIT;') 
        if (results.rowCount === 0){
            throw new Error('NotFound')
        } else {
        return findReimbursementById(results.rows[0])
        }
    } catch(e) {
        client && client.query('ROLLBACK;') 
        if (e.message === "NotFound"){
            throw new ReimbursementNotFoundError
        }
        console.log(e);
        throw new Error ("This error can't be handled, like the way the ring can't be handled by anyone but Frodo")
    } finally {
        client && client.release()
    }
}


//for reimbursements by author user id
export async function findReimbursementByAuthor (userId: number): Promise<Reimbursement[]>{
    let client: PoolClient
    try {
        client = await connectionPool.connect()

        let results: QueryResult = await client.query(`select * from project_0.reimbursements r 
                                            left join  project_0.users u on r.author = u.user_id
                                            left join project_0.reimbursement_status rs on r.status = rs.status_id 
                                            left join project_0.reimbursement_type rt on r."type" = rt.type_id
                                            where r.author =$1
                                            order by r.date_submitted;`, [userId])

        if (results.rowCount === 0){
            throw new Error("NotFound")
        } else {
            return results.rows.map(ReimbursementDTOtoReimbursementConverter) 
        }
    } catch(e) {
        if (e.message === "NotFound"){
            throw new ReimbursementNotFoundError
        }
        console.log(e);
        throw new Error ("This error can't be handled, like the way the ring can't be handled by anyone but Frodo")
    } finally {
        client && client.release() 
    }
}

//for reimbursements by status id
export async function findReimbursementByStatus (statusId: number): Promise<Reimbursement[]>{
    let client: PoolClient
    try {
        client = await connectionPool.connect()
        let results: QueryResult = await client.query(`select * from project_0.reimbursements r 
                                                    left join  project_0.users u on r.author = u.user_id
                                                    left join project_0.reimbursement_status rs on r.status = rs.status_id 
                                                    left join project_0.reimbursement_type rt on r."type" = rt.type_id
                                                    where r.status =$1
                                                    order by r.date_submitted;`, [statusId])

        if (results.rowCount === 0){
            throw new Error("NotFound")
        } else {
            return results.rows.map(ReimbursementDTOtoReimbursementConverter) 
        }
    } catch(e) {
        if (e.message === "NotFound"){
            throw new ReimbursementNotFoundError
        }
        console.log(e);
        throw new Error ("This error can't be handled, like the way the ring can't be handled by anyone but Frodo")
    } finally {
        client && client.release() 
    }
}