set schema 'project_0';

truncate roles cascade;
truncate users cascade;
truncate reimbursements cascade;
truncate reimbursement_type cascade;
truncate reimbursement_status cascade;

insert into roles ("role")
	values 	('Finance-manager'),
			('Admin'),
			('Fellowship Member');
		
insert into users ("username", "password", "first_name", "last_name", "email", "role")
	values 	('Mithrandir', 'YouShallNotPass', 'Gandalf', 'the Grey', 'shadofaxTheFast@email.com', 1),
			('RingBearer', 'MyPrecious', 'Frodo', 'Baggins', 'frodoUnderhill@email.com', 2),
			('SamIAm', 'password', 'Samwise', 'Gamgee', 'potatoes4life@email.com', 3),
		 	('MerryMerry', 'BrandybuckBoi', 'Meriadoc', 'Brandybuck', 'tallerThanPippin@email.com', 3),
		 	('FoolOfATook', '00psMyBad', 'Peregrin', 'Took', 'tallerThanMerry@email.com', 3),
		 	('Strider', 'Actually87', 'Aragron II', 'Elessar Telcontar', 'Heir2Isildur@email.com', 1),
		 	('LorealLegolas', 'BecauseYouAreWorthIt', 'Legolas', 'Greenleaf', 'EndlessQuiver@email.com', 1),
		 	('GoldenGimli', 'ThatStillOnlyCountsAs1', 'Gimli', 'Son of Gloin', 'lockbearer@email.com', 3),
		 	('CaptainoftheWhiteTower', '2ManyArrows', 'Boromir', 'Son of Denethor', 'sterwardPrince@email.com', 3);
		 
insert into reimbursement_type ("type")
	values 	('Provisions'),
			('Transportation'),
			('Weapons and Armor'),
			('Miscellaneous');

insert into reimbursement_status ("status")
	values 	('Resolved'),
			('Denied'),
			('Pending');
		
insert into reimbursements ("author", "amount", "dateSubmitted", "dateResolved", "description", "resolver", "status", "type")
	values 	(2, 34.59, '1954-01-01 00:00:00', '1954-01-11 00:00:00', 'Picked up some gear in the Shire', 1, 1, 1), 
			(3, 25.45, '1954-02-01 00:00:00', '1954-02-11 00:00:00', 'Bought Bill the Pony in Bree', 1, 1, 2),
			(7, 19.76, '1954-03-01 00:00:00', '1954-03-11 00:00:00', 'Dwarves require more sustenance!  I bought some myself!', 1, 1, 1),
			(6, 200.00, '1954-04-01 00:00:00', '1954-04-11 00:00:00', 'Paid the elves for boats and supplies', 6, 1, 4),
			(8, 79.99, '1954-05-01 00:00:00', '1954-05-11 00:00:00', 'Bought arrows from Rohan.', 6, 3, 3),
			(5, 60.87, '1954-06-01 00:00:00', '1954-06-11 00:00:00', 'Wild night for Merry and I with that ent draft.  Definitely necessary for team morale', 6, 2, 1),
			(1, 79.99, '1954-07-01 00:00:00', '1954-07-11 00:00:00', 'New rodes, since I am white now', 6, 1, 4),
			(4, 10.23, '1954-08-01 00:00:00', '1954-08-11 00:00:00', 'Bought a fake mustache for Eowyn to blend in a bit, even if she is no man', 1, 3, 4);
	
select * from users;
select * from reimbursements;