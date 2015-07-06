FDA Recall Interactive Map: http://18fchallenge.tcg.com/

gsachallenge - Installation Notes and API Documentation
=====================================================

This document contains notes on installation and API syntax related to TCG's submission for the 18F Challenge. For information on general architecture and approach, see the more general readme.md file. 

### Containerization -- Using Docker to easily get started ###

In a traditional Docker deployment, individual services are split into
separate containers (so that one main process is run in its own
container). This generally encourages container reuse. For this
prototype, we have an opportunity to leverage Docker for a
non-traditional use case: to permit curious individuals to easily
instantiate their own copy of the FDA Recall Interactive Map.

To do this:

 * Please install docker for your environment:
   https://docs.docker.com/installation/
 * Checkout or download a full copy of the project's source code from
   github: https://github.com/TCGInc/gsachallenge

        git clone https://github.com/TCGInc/gsachallenge.git

 * Change your directory to gsachallenge/docker and run the build
   script to create the "gsachallenge" docker image (this requires a
   user with sudo privileges):

        cd gsachallenge/docker
        ./build_docker.sh

 * You can then run the "gsachallenge" docker image ("-d" tells docker
   to run the image in the background, while "-p 8888:80" maps the
   container's web port, port 80, to localhost's port 8888):

        sudo docker run -d -p 8888:80 gsachallenge

 * It takes a number of seconds for the docker image server to come
   on-line, after which you can access the local copy of the FDA
   Recall interactive map at http://localhost:8888/

 * NOTE: The resulting docker images have two mount points: /gsac for
   the source code and /var/lib/postgres/9.4/main for the PostgreSQL
   database. The easiest way to initialize these mount points is to
   copy the directories from the completed docker file system. The
   purpose of using the volume points is to allow updating the source
   code and persisting data across docker environments.

### How to get started (manually) ###

Installing the FDA Recall Interactive Map from scratch is a bit more
involved than building a Docker container. The following instructions
assume an Ubuntu 12.04 LTS system (though it could be run on any
environment that supports Postgres 9.4 and Node):

 * Get the latest source from github:

        git clone https://github.com/TCGInc/gsachallenge.git

 * Install PostgreSQL 9.4 (or later). As root:

        # Add the Postgres repository and install the key
        echo "deb http://apt.postgresql.org/pub/repos/apt/ precise-pgdg main" > /etc/apt/sources.list.d/pgdg.list
        wget --quiet -O - --no-check-certificate https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
        # install the packages
        apt-get update
        apt-get -y install postgresql-9.4 postgresql-contrib-9.4

 * Create the gsac user and database (update the authentication as
   needed):

        su - postgres
        /etc/init.d/postgresql start
        psql --command "CREATE USER gsac WITH SUPERUSER PASSWORD 'gsac123';"
        createdb -O gsac gsac
        exit

 * Import the database. The simplest method is to import the database
   from the github project (alternatively you can re-import and clean
   the openFDA data following the instructions in
   gsachallenge/database/bootstrap/README.txt):

        gunzip -c gsachallenge/docker/gsac.sql.gz | PGPASSWORD=gsac123 psql -U gsac

 * Install node and NPM (version 0.10 was necessary for Karma/Mocha):
        
        # Install node
        wget http://nodejs.org/dist/v0.10.38/node-v0.10.38.tar.gz
        tar -zxf node-v0.10.38.tar.gz
        # Get compilation tools
        apt-get -y install build-essential
        # Compile node
        cd node-v0.10.38 && ./configure && make install
        cd ..
        # Grab and install NPM
        wget --no-check-certificate https://www.npmjs.org/install.sh && sh ./install.sh

 * Install node package dependencies:

        cd gsachallenge
        npm install
        cd ..

 * Run node

        cd gsachallenge
        node index.js

At this point you should be able to access the application at
http://localhost/ .

## Cron job to update the database from openFDA ##

We download a copy of the openFDA data into a local PostgreSQL
database so that we can massage the location information. Therefore,
we want to make sure to periodically check openFDA for new data. The
perl script database/bootstrap/fdaApiDataLoader.pl accomplishes this
task. To install this script, first install the dependencies:

    sudo apt-get install libdbd-pg-perl libxml-simple-perl libjson-pp-perl libdatetime-perl

edit database/bootstrap/fdaApiDataLoader.pl to match your database
password, and then add a cron job to periodically call the script. The following
cron line will update the database at 3AM and assumes that the source is installed
in /opt/gsachallenge:

    0 3 * * * cd /opt/gsachallenge/database/bootstrap/; /usr/bin/perl fdaApiDataLoader.pl > /dev/null

## Public API ##

Two API endpoints are provided for accessing the results of our distribution pattern normalization effort. The first endpoint returns the states in which a product was distributed for a given category of products (drug, device, food). The second endpoint returns the states in which a product was distributed for a specific recall.

### 1. /fda/recalls/[productType]/states

Endpoint to get distribution states for all recalls of a given product type

#### HTTP Method
GET

#### Parameters:

| Parameter | Description |
|----------|----------|
|  productType  |  Provide one of the openFDA nouns (food, device, drug)  |

#### Output Format:
Every response will contain two properties:
| Property | Description |
|----------|----------|
|  result  |  The result of the call, if successful.  |
|  status  | Metadata about the result including if an error occurred and what the error was. |

Response JSON structure:
```json
{
    "result": {
        "distributionStates": {
            "<event id>": [
                "<state>",
                ...
            ],
            "<event id>": [
                "<state>",
                ...
            ]
        }
    },
    "status": {
        "error": <true/false>,
        "message": "<Error message if applicable>",
    }
}
```
*Note:* If a recalled product was distributed in all 50 states and Washington, DC only a single "NATIONWIDE" element will be included in the array.
#### Sample output:
```json
{
    "result": {
        "distributionStates": {
            "33431": [
                "NATIONWIDE"
            ],
            "33728": [
                "NATIONWIDE"
            ],
            "37530": [
                "KY",
                "NC",
                "NY"
            ],
			...
		}
    },
    "status": {
        "error": false
    }
}
```

### 2. /fda/recalls/[productType]/[eventId]/states

Endpoint to get distribution states of a product in a specific recall

#### HTTP Method
GET

#### Parameters:

| Parameter | Description |
|----------|----------|
|  productType  |  Provide one of the openFDA nouns (food, device, drug)  |
|  eventId  | Event ID of the recall  |

#### Output Format:
Every response will contain two properties:
| Property | Description |
|----------|----------|
|  result  |  The result of the call, if successful. This will be null if the event ID is not found.  |
|  status  | Metadata about the result including if an error occurred and what the error was. |

Response JSON structure:
```json
{
    "result": {
        "distributionStates": [
            "<state>",
            ...
        ]
    },
    "status": {
        "error": <true/false>,
        "message": "<Error message if applicable>",
    }
}
```
*Note:* If a recalled product was distributed in all 50 states and Washington, DC only a single "NATIONWIDE" element will be included in the array.

#### Sample output:
```json
{
    "result": {
        "distributionStates": [
            "CO",
            "FL",
            "GA",
            "MD",
            "MO",
            "OH",
            "PA",
            "TX",
            "UT",
            "WA"
        ]
    },
    "status": {
        "error": false
    }
}
```