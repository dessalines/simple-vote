--liquibase formatted sql

--changeset tyler:1

create table user_ (
    id bigserial primary key,
    name varchar(255),
    created timestamp default current_timestamp
);

--rollback drop table user_ cascade;

-- Just used for persisting logins, in case they need to be loaded by other instances on startup
CREATE TABLE login (
    id bigserial primary key,
    user_id bigint not null,
    jwt VARCHAR(255) not null,
    created timestamp default current_timestamp,
    constraint fk1_login_user foreign key (user_id)
        references user_ (id)
        on update cascade on delete cascade
);

--rollback drop table login cascade;

create table question_set (
    id bigserial primary key,
    user_id bigint not null,
    title varchar(255),
    created timestamp default current_timestamp,
    constraint fk1_question_set_user foreign key (user_id)
        references user_ (id)
        on update cascade on delete cascade
);

--rollback drop table question_set cascade;

create table question (
    id bigserial primary key,
    user_id bigint not null,
    title varchar(255) not null,
    question_set_id bigint not null,
    expire_time timestamp default null,
    threshold smallint not null default 30,
    users_can_add_candidates boolean not null default true,
    created timestamp default current_timestamp,
    constraint fk1_question_user foreign key (user_id)
        references user_ (id)
        on update cascade on delete cascade,
    constraint fk2_question_question_set foreign key (question_set_id)
        references question_set (id)
        on update cascade on delete cascade
);

--rollback drop table question cascade;

create table candidate (
    id bigserial primary key,
    user_id bigint not null,
    question_id bigint not null,
    title varchar(255) not null,
    created timestamp default current_timestamp,
    constraint fk1_candidate_user foreign key (user_id)
        references user_ (id)
        on update cascade on delete cascade,
    constraint fk2_candidate_question foreign key (question_id)
        references question_set (id)
        on update cascade on delete cascade
);

--rollback drop table candidate cascade;

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

--rollback drop table vote cascade;

create table comment (
    id bigserial primary key,
    user_id bigint not null,
    question_set_id bigint not null,
    comment text not null,
    created timestamp default current_timestamp,
    constraint fk1_question_user foreign key (user_id)
        references user_ (id)
        on update cascade on delete cascade,
    constraint fk2_question_question_set foreign key (question_set_id)
        references question_set (id)
        on update cascade on delete cascade
);

--rollback drop table comment cascade;
