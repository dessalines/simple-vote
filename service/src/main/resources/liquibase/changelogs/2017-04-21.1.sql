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

insert into user_ (name) values ('jim');
--rollback truncate table user_ restart identity cascade;

insert into poll (user_id, title) values (1, 'test poll');
--rollback truncate table poll restart identity cascade;

insert into question (user_id, poll_id, title) values
(1,1,'q 1'),
(1,1, 'q 2');
--rollback truncate table question restart identity cascade;

insert into candidate (user_id, question_id, title) values
(1,1, 'c1'),
(1,1, 'c2'),
(1,2, 'c3');
--rollback truncate table candidate restart identity cascade;

insert into vote (user_id, candidate_id, vote) values
(1,1, 80),
(1,3, 90);
--rollback truncate table vote restart identity cascade;

insert into comment (user_id, poll_id, comment) values (1,1,'first comment');
--rollback truncate table comment restart identity cascade;
