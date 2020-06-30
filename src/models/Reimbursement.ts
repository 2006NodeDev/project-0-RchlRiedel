
//The Reimbursement model is used to represent a single reimbursement that an employee would submit

export class Reimbursement {
    reimbursementId: number; // primary key
	author: number;  // foreign key -> User, not null
	amount: number;  // not null
    dateSubmitted: Date; // not null  
    dateResolved: Date; // not null
    description: string; // not null
    resolver: number; // foreign key -> User
    status: number; // foreign key -> ReimbursementStatus, not null
    type: number // foreign key -> ReimbursementType
}
