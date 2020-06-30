import {Pool} from 'pg'

//build a connection pool - same db as lightly burning
export const connectionPool:Pool = new Pool ({ 
    host:process.env['LB_Host'],
    user: process.env['LB_User'],
    password: process.env['LB_Password'], 
    database: process.env['LB_Database'], 
    port: 5432, 
    max: 5 
})
