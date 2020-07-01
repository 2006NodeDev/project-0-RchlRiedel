set schema 'project_0';

truncate roles cascade;
truncate users cascade;
truncate reimbursements cascade;
truncate reimbursement_type cascade;
truncate reimbursement_status cascade;

insert into roles ("role")
	values 	('Finance-manager'),
			('Admin'),
			('Fellowship Member'),
			('Deceased');
		
insert into users ("username", "password", "first_name", "last_name", "email", "role")
	values 	('Mithrandir', 'YouShallNotPass', 'Gandalf', 'the Grey', 'shadofaxTheFast@email.com', 1),
			('RingBearer', 'MyPrecious', 'Frodo', 'Baggins', 'frodoUnderhill@email.com', 2),
			('SamIAm', 'password', 'Samwise', 'Gamgee', 'potatoes4life@email.com', 3),
		 	('MerryMerry', 'BrandybuckBoi', 'Meriadoc', 'Brandybuck', 'tallerThanPippin@email.com', 3),
		 	('FoolOfATook', '00psMyBad', 'Peregrin', 'Took', 'tallerThanMerry@email.com', 3),
		 	('Strider', 'Actually87', 'Aragron II', 'Elessar Telcontar', 'Heir2Isildur@email.com', 1),
		 	('LorealLegolas', 'BecauseYouAreWorthIt', 'Legolas', 'Greenleaf', 'EndlessQuiver@email.com', 3),
		 	('GoldenGimli', 'ThatStillOnlyCountsAs1', 'Gimli', 'Son of Gloin', 'lockbearer@email.com', 3),
		 	('CaptainoftheWhiteTower', 'NearamirFaramir', 'Boromir', 'Son of Denethor', 'sterwardPrince@email.com', 3);
		 
insert into reimbursement_type ("type")
	values 	('Provisions'),
			('Transportation'),
			('Weapons and Armor'),
			('Miscellaneous');

insert into reimbursement_status ("status")
	values 	('Approved'),
			('Denied'),
			('Pending');
		
insert into reimbursements ("author", "amount", "date_submitted", "date_resolved", "description", "resolver", "status", "type")
	values 	(2, 34.59, '1954-01-01 00:00:00', '1954-01-11 00:00:00', 'Picked up some gear in the Shire', 1, 1, 1), 
			(3, 25.45, '1954-02-01 00:00:00', '1954-02-11 00:00:00', 'Bought Bill the Pony in Bree', 1, 1, 2),
			(7, 19.76, '1954-03-01 00:00:00', '1954-03-11 00:00:00', 'Dwarves require more sustenance!  I bought some myself!', 1, 1, 1),
			(6, 200.00, '1954-04-01 00:00:00', '1954-04-11 00:00:00', 'Paid the elves for boats and supplies', 6, 1, 4),
			(8, 79.99, '1954-05-01 00:00:00', '1954-05-11 00:00:00', 'Bought arrows from Rohan.', 6, 3, 3),
			(5, 60.87, '1954-06-01 00:00:00', '1954-06-11 00:00:00', 'Wild night for Merry and I with that ent draft.  Definitely necessary for team morale', 6, 2, 1),
			(1, 79.99, '1954-07-01 00:00:00', '1954-07-11 00:00:00', 'New rodes, since I am white now', 6, 1, 4),
			(4, 10.23, '1954-08-01 00:00:00', '1954-08-11 00:00:00', 'Bought a fake mustache for Eowyn to blend in a bit, even if she is no man', 1, 3, 4);

		
--test queries

select rt.type_id from project_0.reimbursement_type rt 
                                        where rt."type" = 'Provisions';

--getAllReimbursements		
--select * from reimbursements r 
	--left join  users u on r.author = u.user_id
	--left join reimbursement_status rs on r.status = rs.status_id 
	--left join reimbursement_type rt on r."type" = rt.type_id;

--getReimbursementsById
--select * from project_0.reimbursements r 
	--left join  project_0.users u on r.author = u.user_id
	--left join project_0.reimbursement_status rs on r.status = rs.status_id 
	--left join project_0.reimbursement_type rt on r."type" = rt.type_id
	--where r.reimbursement_id = 4;
		
--getReimbursementByAuthor
--select * from project_0.reimbursements r 
    --left join  project_0.users u on r.author = u.user_id
    --left join project_0.reimbursement_status rs on r.status = rs.status_id 
    --left join project_0.reimbursement_type rt on r."type" = rt.type_id
    --where r.author = 4;

--getReimbursementByStatus
--select * from project_0.reimbursements r 
    --left join  project_0.users u on r.author = u.user_id
    --left join project_0.reimbursement_status rs on r.status = rs.status_id 
    --left join project_0.reimbursement_type rt on r."type" = rt.type_id
    --where r.status =3
    --order by r.date_submitted;
    
--submitReimbursement
--insert into project_0.reimbursements ("author", "amount", "date_submitted", "date_resolved", "description", "resolver", "status", "type")
	--values (3, 8.88, current_timestamp, null, 'Potatos for stew', null, 3, 1) returning reimbursement_id;
--select * from project_0.reimbursements r 
	--left join  project_0.users u on r.author = u.user_id
	--left join project_0.reimbursement_status rs on r.status = rs.status_id 
	--left join project_0.reimbursement_type rt on r."type" = rt.type_id
	--where r.reimbursement_id = 9;
	
--updateReimbursement 
--update project_0.reimbursements 
    --set date_resolved = current_timestamp , description = 'Potatos for boiling, mashing, or sticking in a stew', resolver = 1, status = 1, type = 1
    --where reimbursement_id = 9 returning reimbursement_id;
--select * from project_0.reimbursements r 
	--left join  project_0.users u on r.author = u.user_id
	--left join project_0.reimbursement_status rs on r.status = rs.status_id 
	--left join project_0.reimbursement_type rt on r."type" = rt.type_id
	--where r.reimbursement_id = 9;
	
		
		
--getAllUsers                                                    
--select u.user_id, u.username, u."password", u.first_name, u.last_name, u.email, r."role", r.role_id 
	--from project_0.users u left join project_0.roles r on u."role" = r."role_id";
	
--getUsersById
--select u.user_id, u.username, u."password", u.first_name, u.last_name, u.email, r."role", r.role_id from project_0.users u 
	--left join project_0.roles r on u."role" = r."role_id" 
    --where u.user_id = 3;
	
--getUserByUsernameAndPassword
--select u.user_id, u.username, u."password", u.first_name, u.last_name, u.email, r."role", r.role_id from project_0.users u 
          -- left join project_0.roles r on u."role" = r."role_id" 
          -- where u.username = 'LorealLegolas' and u.password = 'BecauseYouAreWorthIt';

--updateUser (make sure to restart schema before submitting, else will save)
--update project_0.users 
	--set "username" = 'GondorButNotForgotten', "password"= '2ManyArrows', "email" = null, "role"= 4 --should be able to say deceased
    --where user_id = 9 returning user_id;		
--getUsersById (confirm change)
--select u.user_id, u.username, u."password", u.first_name, u.last_name, u.email, r."role", r.role_id from project_0.users u 
	--left join project_0.roles r on u."role" = r."role_id" 
    --where u.user_id = 9;
   
                                                   
                                                   
                                                   
                                                   
                                                   
                                                   