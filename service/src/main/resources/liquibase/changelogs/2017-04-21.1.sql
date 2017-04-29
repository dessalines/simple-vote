--liquibase formatted sql

--changeset tyler:2

create view poll_user_view as

-- get voters
select distinct user_.id, user_.name, user_.created, poll.id as poll_id from user_
inner join vote on vote.user_id = user_.id
inner join candidate on candidate.id = vote.candidate_id
inner join question on question.id = candidate.question_id
inner join poll on poll.id = question.poll_id

union

-- get candidate makers
select distinct user_.id, user_.name, user_.created, poll.id as poll_id from user_
inner join candidate on candidate.user_id = user_.id
inner join question on question.id = candidate.question_id
inner join poll on poll.id = question.poll_id

union

-- get question makers
select distinct user_.id, user_.name, user_.created, poll.id as poll_id from user_
inner join question on question.user_id = user_.id
inner join poll on poll.id = question.poll_id

union

-- get poll makers
select distinct user_.id, user_.name, user_.created, poll.id as poll_id from user_
inner join poll on poll.user_id = user_.id

union

-- get commenters
select distinct user_.id, user_.name, user_.created, poll.id as poll_id from user_
inner join comment on comment.user_id = user_.id
inner join poll on poll.id = comment.poll_id;




-- rollback drop view poll_user_view cascade;

insert into user_ (name) values ('Sarah'), ('Julie'), ('Timmy');
--rollback truncate table user_ restart identity cascade;

insert into poll (user_id, title, users_can_add_questions) values (1, 'Animals', false);
--rollback truncate table poll restart identity cascade;

insert into question (user_id, poll_id, title, users_can_add_candidates) values
(1,1,'As a judge in the cuteness olympics, which gets 1st place ribbon?', false),
(3,1, 'Which is better when well fed?', false);
--rollback truncate table question restart identity cascade;

insert into candidate (user_id, question_id, title) values
(1,1, 'Lil Yapper'),
(2,1, 'Spiny boi (porcupine)'),
(1,1, 'A big ole toader'),
(2,1, 'Flappy fish (mudskipper)'),
(3,1, 'A meower'),
--
(1,2, 'A sub woofer'),
(2,2, 'Winged squirrel'),
(1,2, 'Froggo'),
(2,2, 'A Shibe'),
(3,2, 'Pointy bird');
--rollback truncate table candidate restart identity cascade;

insert into vote (user_id, candidate_id, vote) values
(1,1, 53),
(2,2, 27),
(3,5, 78),
(1,4, 51),
(2,5, 16),
(3,6, 7),
(1,7, 86),
(2,8, 43),
(3,10, 62),
(1,3, 42),
(2,4, 89);
--rollback truncate table vote restart identity cascade;

insert into comment (user_id, poll_id, comment) values (1,1,'Hola friends!');
--rollback truncate table comment restart identity cascade;
