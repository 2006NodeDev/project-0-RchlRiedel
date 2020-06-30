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
                                                        left join project_0.reimbursement_type rt on r."type" = rt.type_id;`) 
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
export async function findReimbursementById (id:number): Promise<Reimbursement> {
    let client: PoolClient
    try {
        client = await connectionPool.connect()
        let results: QueryResult = await client.query(``)
        if (results.rowCount === 0){
            throw new Error ("NotFound")
        } else {
            return ReimbursementDTOtoReimbursementConverter(results.rows[0])
        }
    } catch (e) {
        if (e.message === "Not Found") {
            throw new ReimbursementNotFoundError()
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
                                        where rt."type" = $1;` [newReimbursement.type])
        if (typeId.rowCount === 0 && newReimbursement.type !== null){ //if type not found, but it can be null
            throw new Error("Type Not Found. (Please specify Provisions, Transportation, Weapons and Armor, or Msicellaneous)")
        }
        typeId = typeId.rows[0].type_id //get the type id number given the string of type
        //need to do this for author and status as well


        let results = await client.query(`insert into project_0.reimbursements ("author", "amount", "date_submitted", "date_resolved", "description", "resolver", "status", "type")
                                            values ($1,$2,$3,$4,$5,$6,$7,$8) returning reimbursement_id`, 
                                            [newReimbursement.author, newReimbursement.amount, newReimbursement.dateSubmitted, newReimbursement.dateResolved, 
                                            newReimbursement.description, newReimbursement.resolver, newReimbursement.status, newReimbursement.type])
        newReimbursement.reimbursementId = results.rows[0].reimbursement_id
        
        await client.query('COMMIT;') //end transaction
        return newReimbursement

    } catch(e) {
        client && client.query('ROLLBACK;') //if a js error takes place, send it back
        if (e.message === "Type Not Found. (Please specify Provisions, Transportation, Weapons and Armor, or Msicellaneous)"){
            throw new ReimbursementInputError()
        }
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
        //await client.query('BEGIN;') //add a transaction
        //we'll assume finance-managers know the id numbers for types, so we won't have to convert
        //let's actually not do that

        let results = await client.query(`update project_0.reimbursements r
                                        set r.author = $1, r.amount = $2, r.date_submitted = $3, date_resolved = $4, description = $5, resolver = $6, status = $7, type = $8
                                        where r.reimbursement_id = $7;`,  
                                            [updatedReimbursement.author, updatedReimbursement.amount, updatedReimbursement.dateSubmitted, updatedReimbursement.dateResolved, updatedReimbursement.description, 
                                                updatedReimbursement.resolver, updatedReimbursement.status, updatedReimbursement.type, updatedReimbursement.reimbursementId]) 
                                                //not sure about statusId or typeId
        //await client.query('COMMIT;') //end transaction
        if (results.rowCount === 0){
            throw new Error('NotFound')
        } else {
        return findReimbursementById(updatedReimbursement.reimbursementId)
        }
    } catch(e) {
        if (e.message === "NotFound"){
            throw new ReimbursementNotFoundError()
        }
        //client && client.query('ROLLBACK;') //if a js error takes place, send it back
        throw new Error ("This error can't be handled, like the way the ring can't be handled by anyone but Frodo")
    } finally {
        client && client.release()
    }
}


//for reimbursements by author user id
export async function findReimbursementByAuthor (userId: number){
    let client: PoolClient
    try {
        client = await connectionPool.connect()

        let results: QueryResult = await client.query(`select * from project_0.reimbursements r 
                                            left join  project_0.users u on r.author = u.user_id
                                            left join project_0.reimbursement_status rs on r.status = rs.status_id 
                                            left join project_0.reimbursement_type rt on r."type" = rt.type_id
                                            where r.author =$1;` [userId])

        if (results.rowCount === 0){
            throw new Error("NotFound")
        } else {
            return ReimbursementDTOtoReimbursementConverter(results.rows[0])
        }
    } catch(e) {
        if (e.message === "NotFound"){
            throw new ReimbursementNotFoundError()
        }
        console.log(e);
        throw new Error ("This error can't be handled, like the way the ring can't be handled by anyone but Frodo")
    } finally {
        client && client.release() 
    }
}

//for reimbursements by status id
export async function findReimbursementByStatus (statusId: number){
    let client: PoolClient
    try {
        client = await connectionPool.connect()
        //need to input query!!!!!!!
        let results: QueryResult = await client.query(`select * from project_0.reimbursements r 
                                                    left join  project_0.users u on r.author = u.user_id
                                                    left join project_0.reimbursement_status rs on r.status = rs.status_id 
                                                    left join project_0.reimbursement_type rt on r."type" = rt.type_id
                                                    where r.status =$1;` [statusId])

        if (results.rowCount === 0){
            throw new Error("NotFound")
        } else {
            return ReimbursementDTOtoReimbursementConverter(results.rows[0])
        }
    } catch(e) {
        if (e.message === "NotFound"){
            throw new ReimbursementNotFoundError()
        }
        console.log(e);
        throw new Error ("This error can't be handled, like the way the ring can't be handled by anyone but Frodo")
    } finally {
        client && client.release() 
    }
}