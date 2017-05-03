--liquibase formatted sql

--changeset tyler:3

alter table question add column anonymous boolean not null default false;

--rollback alter table question drop column anonymous;