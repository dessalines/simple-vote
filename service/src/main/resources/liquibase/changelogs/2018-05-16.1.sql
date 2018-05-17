--liquibase formatted sql

--changeset tyler:6

alter table poll add column predefined_user_list text;

-- rollback alter table poll drop column predefined_user_list;
