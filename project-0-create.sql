create schema project_0;
set schema 'project_0';

drop table users;
drop table roles;
drop table reimbursement_type;
drop table reimbursement_status;
drop table reimbursements;


create table roles(
	"role_id" serial primary key,
	"role" text
);
--select * from roles;

create table users(
	"user_id" serial primary key,
	"username" text not null unique,
	"password" text not null,
	"first_name" text, --want these not null?
	"last_name"text,
	"email" text,
	"role" int references roles ("role_id") --fk to roles
);
--select * from users;

create table reimbursement_status(
	"status_id" serial primary key,
	"status" text not null unique
);

create table reimbursement_type(
	"type_id" serial primary key,
	"type" text not null unique
);

create table reimbursements(
	"reimbursement_id" serial primary key,
	"author" int references users ("user_id") not null, --foreign key -> User, not null
	"amount" numeric (12,2) not null,
    "date_submitted" timestamp not null, 
    "date_resolved" timestamp,
    "description" text not null,
    "resolver" int references users ("user_id"), -- different user (i.e. financial mangager
    "status" int references reimbursement_status ("status_id") not null, --fk ReimbursementStatus
    "type" int references reimbursement_type ("type_id") --fk ReimbursementType
);