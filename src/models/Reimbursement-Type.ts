
//The ReimbursementType model is used to track what kind of reimbursement is being submitted. 
//Type possibilities are "Provisions", "Transportation", "Weapons and Armor", and "Miscellaneous".

export class ReimbursementType {
    typeId: number; // primary key
    type: string // not null, unique
}
