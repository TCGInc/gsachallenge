#!/bin/bash

#
# Utility script to update changelogs against the database.
#

if [ "$#" -ne 2 ]; then
	echo ""
	echo "Error: You must enter the database username and password as arguments."
	echo "Usage: ./db.update.sh dbUsername dbPassword"
	echo ""
	exit 1;
fi

database/liquibase \
	--changeLogFile=database/db.changelog-master.xml \
	--username=$1 \
	--password=$2 \
	--url=jdbc:postgresql://localhost:5432/gsac \
	--driver=org.postgresql.Driver \
	--classpath=database/postgresql-9.4-1201.jdbc4.jar \
	update

