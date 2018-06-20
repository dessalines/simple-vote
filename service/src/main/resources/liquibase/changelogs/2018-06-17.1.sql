--liquibase formatted sql
--changeset tyler:7

-- Adding user logins

alter table user_ add column email varchar(255) unique;
alter table user_ add column password_encrypted varchar(512);

--rollback alter table user_ drop column email;
--rollback alter table user_ drop column password_encrypted;
