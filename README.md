Prototype: http://18fchallenge.tcg.com/

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
following selection of technologies:

 * Node.js - back-end environment - Node.js allows us to simplify our
   development environment by using the same language, JavaScript,
   across the full application stack. As a foundational technology it
   addresses all three of the factors through its use at 18F and our
   familiarity with it.
 * Express - node.js web application framework
 * AngularJS - data binding (model-view)
 * jQuery - DOM utilities
 * PostgreSQL - both relational and JSON storage potential with
   free-text search
 * Karma/Mocha - unit testing framework
 * Bootstrap - responsive layout
 * Font Awesome - vector icons and font framework
 * App.js - web widgets that behave like mobile native elements
 * Jenkins - continuous integration, testing, and production
   deployment
 * nagios - continuous monitoring
 * Docker - containerization




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
