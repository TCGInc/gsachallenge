FDA Recall Interactive Map: http://18fchallenge.tcg.com/

gsachallenge - TCG's GSA ADS 18F Challenge Submission
=====================================================

Our GSA Agile Delivery Services submission allows users to search and
navigate the openFDA drug, service, and food enforcement data
(available at http://open.fda.gov) by location, type, date, product
description, and recall reason. This application provides two key
services:

 1. procedures to analyze and clean the free-text location data for
    search, and
 2. the resulting ability to easily navigate recall data by state
    (through a touch-interactive map of the United States).

### Architecture ###

Our choice of architecture components was guided by the following
factors:

 1. the ability to achieve our user representative's goals,
 2. compatibility with 18F's existing body of work, and
 3. our team's familiarity with the environment.

Through initial user experience discussions, it quickly became clear
that the desired end goal was a web-based responsive-design single
page application that permitted free-text search, location-based
search, and navigation of FDA enforcement data. This led to the
following selection of component technologies:

 * Node.js - back-end environment - Node.js allows us to simplify our
   development environment by using the same language, JavaScript,
   across the full application stack. As a foundational technology it
   addresses all three of the factors through its use at 18F and our
   familiarity with it.

 * Express - node.js web application framework - We use Express to
   provide the HTTP application requests and develop REST services for
   data and search requests from the single-page application.

 * AngularJS - data binding (model-view) - Within our single-page
   application, we rely on AngularJS to automatically update our
   interactive widgets based upon retrieved data.

 * PostgreSQL - relational database - We use PostgreSQL for its
   flexibility, providing both traditional relational database and
   JSON object storage. In addition, we rely upon its built-in free
   text searching to quickly slice through the FDA data.

 * jQuery Datatables - Interactive table widget - By itself, jQuery
   provides general DOM and CSS manipulation. The Datatables plugin
   creates a highly polished and interactive table for information
   display, sorting, and paging.

 * Font Awesome - vector icons and font framework - This framework
   simlifies the iconography used in our single-page application.

 * Bootstrap - responsive layout - We use Bootstrap to allows us to
   reformat the page structure and individual widgets to support a
   variety of mobile and desktop configurations.

 * App.js - web widgets - App.js provides us a number of widgets (such
   as a date-picker) that behave like mobile native elements.

 * Karma/Mocha - unit testing framework - With Karma and Mocha we are
   able to exercise the services and front end (through phantomjs). By
   plugging our unit test harness into Jenkins, we are able to
   generate a unit test report within continuous integration.

 * Jenkins - continuous integration, testing, and production
   deployment - By installing and configuration Jenkins, we created a
   continuous integration environment that monitors git, automatically
   updates integration with commits, runs our unit tests, and reports
   upon the status of our tests.

 * Nagios - continuous monitoring - We use the open source Nagios core
   for both local monitoring of the production environment (for netork
   and system resources) and remote monitoring of production from our
   integration environment (to ensure public availability).

 * Docker - containerization - Docker allows us to quickly instantiate
   copies of our system (both the node server and database) locally or
   into the cloud.

Additional dependencies include:

 * MomentJS - JavaScript date library - Moment allows us to parse and
   format dates in a consistent manner.

 * Request - Simplified HTTP request client - We use request to call
   openFDA to consume their RESTful API and retrieve data.

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

### Relationship to the US Services Playbook ###
* TODO

### How to get started (Docker) ###
* TODO

### How to get started (manually) ###
* TODO

### Public domain ###

This project is in the worldwide [public domain](LICENSE.md).

This project is in the public domain within the United States, and
copyright and related rights in the work worldwide are waived through
the [CC0 1.0 Universal public domain
dedication](https://creativecommons.org/publicdomain/zero/1.0/).
