--liquibase formatted sql

--changeset tyler:4

create table question_type (
    id bigserial primary key,
    title varchar(255),
    created timestamp default current_timestamp
);

--rollback alter table question drop constraint fk3_question_type;
--rollback drop table question_type;

insert into question_type (title) values ('Range'), ('Pointing Poker');

alter table question add column question_type_id bigint not null default 1;

alter table question add constraint fk3_question_type foreign key (question_type_id)
        references question_type (id)
        on update cascade on delete cascade

-- rollback alter table question drop column question_type_id;
