import { PoolClient, QueryResult } from "pg";
import { connectionPool } from ".";
import { ReimbursementNotFoundError } from "../errors/Reimbursement-Not-Found";
import { ReimbursementDTOtoReimbursementConverter } from "../utilities/ReimbursementDTO-to-Reimbursement-converter";
import { Reimbursement } from "../models/Reimbursement";
import { TypeNotFoundError } from "../errors/Type-Not-Found-Error";
import { StatusNotFoundError } from "../errors/Status-Not-Found-Error";

//get all reimbursements
export async function getAllReimbursements(): Promise<Reimbursement[]>{
    let client: PoolClient 
    try{
        client = await connectionPool.connect() 
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
        await client.query('BEGIN;') 
        //we are letting users input the type, not the type id that is needed for reimbursement
        //thus, we must "convert" using the reimbursement_type table to get the type_id
        let typeId = await client.query(`select rt.type_id from project_0.reimbursement_type rt 
                                        where rt."type" = $1;`, [newReimbursement.type])
        if (typeId.rowCount === 0 && newReimbursement.type !== null){ //if type not found, but it can be null
            throw new Error("Type Not Found")
        }
        typeId = typeId.rows[0].type_id //get the type id number given the string of type
        
        //statusId is specified in router, so we don't need to "convert" it here

        let results = await client.query(`insert into project_0.reimbursements ("author", "amount", "date_submitted", "date_resolved", "description", "resolver", "status", "type")
                                            values ($1,$2,$3,$4,$5,$6,$7,$8) returning reimbursement_id`, 
                                            [newReimbursement.author, newReimbursement.amount, newReimbursement.dateSubmitted, newReimbursement.dateResolved, 
                                            newReimbursement.description, newReimbursement.resolver, newReimbursement.status, typeId])
        
        newReimbursement.reimbursementId = results.rows[0].reimbursement_id
        await client.query('COMMIT;') 
        return findReimbursementById(newReimbursement.reimbursementId)  
    } catch(e) {
        client && client.query('ROLLBACK;')
        if (e.message === "Type Not Found"){
            throw new TypeNotFoundError
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
            throw new Error("Type Not Found")

        }
        //get the status id number given the string of status
        let statusId = await client.query(`select rs.status.id from project_0.reimbursement_status rs 
                                        where rs."status" = $1;`, [updatedReimbursement.status])
        if (statusId.rowCount === 0){ 
            throw new Error("Status Not Found")
        }
        statusId = statusId.rows[0].status_id 

        let results = await client.query(`update project_0.reimbursements
                                        set author = $1, amount = $2, date_resolved = $4, description = $5, resolver = $6, status = $7, type = $8
                                        where reimbursement_id = $7 returning reimbursement_id;`,  
                                            [updatedReimbursement.author, updatedReimbursement.amount, updatedReimbursement.dateResolved, updatedReimbursement.description, 
                                                updatedReimbursement.resolver, statusId, typeId, updatedReimbursement.reimbursementId]) 
        await client.query('COMMIT;') 
        if (results.rowCount === 0){
            throw new Error('NotFound')
        } else {
        return findReimbursementById(results.rows[0])
        }
    } catch(e) {
        client && client.query('ROLLBACK;') 
        if (e.message == "Type Not Found"){
            throw new TypeNotFoundError
        }
        if (e.message === "Status Not Found"){
            throw new StatusNotFoundError
        }
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