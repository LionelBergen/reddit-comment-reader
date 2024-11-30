#!/bin/sh
SET PGPASSWORD=postgresql
psql -h localhost -U postgres -f %~dp0\create_local_database.sql