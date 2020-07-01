
//The ReimbursementStatus model is used to track the status of reimbursements. 
//Status possibilities are Approved, Denied, and Pending

export class ReimbursementStatus {
    statusId: number; // primary key
    status: string // not null, unique
}