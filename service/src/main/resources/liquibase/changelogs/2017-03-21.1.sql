--liquibase formatted sql

--changeset tyler:1

create table user_ (
    id bigserial primary key,
    name varchar(255),
    created timestamp default current_timestamp
);

create table question_set (
    id bigserial primary key,
    user_id bigint not null,
    title varchar(255),
    created timestamp default current_timestamp,
    constraint fk1_question_set_user foreign key (user_id)
        references user_ (id)
        on update cascade on delete cascade
);

create table question (
    id bigserial primary key,
    user_id bigint not null,
    title varchar(255) not null,
    question_set_id bigint not null,
    threshold smallint not null default 30,
    created timestamp default current_timestamp,
    constraint fk1_question_user foreign key (user_id)
        references user_ (id)
        on update cascade on delete cascade
    constraint fk2_question_question_set foreign key (question_set_id)
        references question_set (id)
        on update cascade on delete cascade,
);

create table candidate (
    id bigserial primary key,
    user_id bigint not null,
    question_id bigint not null,
    title varchar(255) not null,
    created timestamp default current_timestamp,
    constraint fk1_candidate_user foreign key (user_id)
        references user_ (id)
        on update cascade on delete cascade
    constraint fk2_candidate_question foreign key (question_id)
        references question_set (id)
        on update cascade on delete cascade,
);

create table vote (
    id bigserial primary key,
    user_id bigint not null,
    candidate_id bigint not null,
    vote smallint not null,
    created timestamp default current_timestamp,
    constraint fk1_vote_user foreign key (user_id)
        references user_ (id)
        on update cascade on delete cascade,
    constraint fk2_vote_candidate foreign key (candidate_id)
        references question (id)
        on update cascade on delete cascade
);


