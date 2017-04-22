--liquibase formatted sql

--changeset tyler:2


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
