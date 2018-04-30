--liquibase formatted sql

--changeset tyler:5

insert into question_type (title) values ('Approval');

--rollback delete from question_type where title='Approval');
