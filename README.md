FDA Recall Interactive Map: http://18fchallenge.tcg.com/

gsachallenge - TCG's GSA ADS 18F Challenge Submission
=====================================================

Our GSA Agile Delivery Services submission allows users to search and
navigate the openFDA: food, device, and drug enforcement data
(available at http://open.fda.gov).  This tool exposes all API data
elements but specializes on the US State through a State normalization
routine (natural languate to states).  This application provides key
services:

 1. routines to analyze and clean the natural language distribution
    pattern, and
 2. the resulting desktop and mobile UI to navigate recall data by state
    (through a touch-interactive map of the United States).

## Architecture ##

Our choice of architecture components was guided by the following
factors:

 1. the ability to achieve our user representative's goals,
 2. compatibility with 18F's existing body of work, and
 3. our team's familiarity with the environment.

Through initial user experience discussions, it quickly became clear
that the desired end goal was a web-based responsive-design single
page application that permitted free-text search, location-based
search, and navigation of FDA enforcement data. This led to the
following selection of component technologies (the licenses for the
technologies are listed after their names):

 * Node.js (MIT License) - back-end environment - Node.js
   allows us to simplify our development environment by using the same
   language, JavaScript, across the full application stack. As a
   foundational technology it addresses all three of the factors
   through its use at 18F and our familiarity with it.

 * Express (MIT License) - node.js web application framework - We use
   Express to provide the HTTP application requests and develop REST
   services for data and search requests from the single-page
   application.

 * AngularJS (MIT License) - data binding (model-view) - Within our
   single-page application, we rely on AngularJS to automatically
   update our interactive widgets based upon retrieved data.

 * PostgreSQL (PostgreSQL License - OSI Approved) - relational
   database - We use PostgreSQL for its flexibility, providing both
   traditional relational database and JSON object storage. In
   addition, we rely upon its built-in free text searching to quickly
   slice through the FDA data.

 * jQuery Datatables (MIT License) - Interactive table widget - By
   itself, jQuery provides general DOM and CSS manipulation. The
   Datatables plugin creates a highly polished and interactive table
   for information display, sorting, and paging.

 * Font Awesome (MIT License) - vector icons and font framework - This
   framework simlifies the iconography used in our single-page
   application.

 * Bootstrap (MIT License) - responsive layout - We use Bootstrap to
   allows us to reformat the page structure and individual widgets to
   support a variety of mobile and desktop configurations.

 * App.js (MIT License) - web widgets - App.js provides us a number of
   widgets (such as a date-picker) that behave like mobile native
   elements.

 * Protractor/Mocha (MIT License) - unit testing framework - With
   Protractor and Mocha we are able to exercise the services and front
   end (through phantomjs). By plugging our unit test harness into
   Jenkins, we are able to generate a unit test report within
   continuous integration.

 * Jenkins (MIT License) - continuous integration, testing, and
   production deployment - By installing and configuration Jenkins, we
   created a continuous integration environment that monitors git,
   automatically updates integration with commits, runs our unit
   tests, and reports upon the status of our tests.

 * Nagios (GPLv2) - continuous monitoring - We use the open source
   Nagios core for both local monitoring of the production environment
   (for netork and system resources) and remote monitoring of
   production from our integration environment (to ensure public
   availability).

 * fail2ban (GPLv2+) - continuous monitoring - We we use the open
   source fail2ban system to monitor ssh logs (and other open services
   as needed) for suspicious atcitivity and automatically ban multiple
   invalid access attempts.

 * Docker (Apache License 2.0) - containerization - Docker allows us
   to quickly instantiate copies of our system (both the node server
   and database) locally or into the cloud.

 * Perl/CURL (GPLv1/Artistic License) - General utility scripts.

Additional dependencies include:

 * MomentJS (MIT License) - JavaScript date library - Moment allows us
   to parse and format dates in a consistent manner.

 * Request (Apache License 2.0) - Simplified HTTP request client - We
   use request to call openFDA to consume their RESTful API and
   retrieve data.

*Unstructured Location Data and the Resulting Architecture* -
Originally we intended to directly consume data from openFDA to
display in the interactive map of recall data. However, the location
field turned out to be unstructured free-text data. This provided us
with both a challenge and a value our application could give to users:
to normalize the location information and allow users to search based
upon location. As a result, we import the openFDA data into PostgreSQL
and clean the data with an ETL script (in Perl). As a result, the FDA
Interactive map application is an n-tier environment:

 * Data tier: PostgreSQL with massaged OpenFDA data
 * Service tier: NodeJS/Express RESTful services 
 * Presentation tier: Angular/Bootstrap/etc. single-page application

## Key Challenge Requirements ##
### Use of IaaS ###

We deployed our prototype (18fchallenge.tcg.com) into Amazon's IaaS
EC2 environment using an Ubuntu virtual machine. In fact we used the
EC2 API to deploy a VMWare image that we originally prepared to help
our developers quickly start working. By using Jenkins, we were able
to use branches for continous deployment to both our integration and
production machines. This allowed us to quickly configure and verify
our various environments.

### Relationship to the US Services Playbook ###

We have provided a mapping of our how team implemented the US  
Digital Services Playbook's thirteen plays and their associated checklists  
in our docs > us_digital_services_playbook_mapping folder. 

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
            "<recall number>": [
                "<state>",
                ...
            ],
            "<recall number>": [
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
            "Z-0563-2014": [
                "NATIONWIDE"
            ],
            "Z-0466-2014": [
                "NATIONWIDE"
            ],
            "Z-0556-2014": [
                "MO",
                "NY",
                "TN",
                "WV"
            ],
			...
		}
    },
    "status": {
        "error": false
    }
}
```

### 2. /fda/recalls/[productType]/[recallNumber]/states

Endpoint to get distribution states of a product in a specific recall

#### HTTP Method
GET

#### Parameters:

| Parameter | Description |
|----------|----------|
|  productType  |  Provide one of the openFDA nouns (food, device, drug)  |
|  recallNumber  | Recall number of the recall  |

#### Output Format:
Every response will contain two properties:
| Property | Description |
|----------|----------|
|  result  | The result of the call, if successful. This will be null if the recall number is not found.  |
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

## Public domain ##

This project is in the worldwide [public domain](LICENSE.md).

This project is in the public domain within the United States, and
copyright and related rights in the work worldwide are waived through
the [CC0 1.0 Universal public domain
dedication](https://creativecommons.org/publicdomain/zero/1.0/).
