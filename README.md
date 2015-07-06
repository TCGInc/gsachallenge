FDA Recall Interactive Map: http://18fchallenge.tcg.com/

gsachallenge - TCG's GSA ADS 18F Challenge Submission
=====================================================

Our GSA Agile Delivery Services submission allows users to search and
navigate the openFDA: food, device, and drug enforcement data
(available at http://open.fda.gov).  The key contributions of this tool are:

 1. converting the original free-text (natural language) location
    information in the FDA data into normalized state data,

 2. presenting the data in a responsive touch-interactive map of the
    United States, and

 3. exposing the normalized data in a REST API.

## Development Approach ##

To successfully complete this prototype iteration, our team: 

 * convened frequently with our external focus group, and utilized
   human centered design techniques to inspire, ideate, and implement;

 * used an Agile Scrum approach to review status, define daily
   sprints, and prioritize work;

 * leveraged existing development environments and technology
   selections based on 18F's answers at the industry conference,
   company capabilities, and this application's needs;

 * tracked progress with an open source development tracker (Redmine),
   while also triaging focus group feedback in real-time using a
   Google spreadsheet; and

 * utilized continuous integration, automated testing, and focus group
   review to reduce cycle time, while improving the product's overall
   quality.


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
following selection of component technologies (the licenses are listed
after their names):

 * Node.js (MIT License) - back-end environment - Allows us to
   simplify our development environment by using the same language,
   JavaScript, across the full application stack. As a foundational
   technology it addresses all three of the factors through its use at
   18F and our familiarity with it.

 * Express (MIT License) - node.js web application framework -
   Provides the HTTP application requests and REST service
   infrastructure for data and search requests from the single-page
   application.

 * AngularJS (MIT License) - data binding (model-view) - Automatically
   updates our interactive widgets based upon retrieved data.

 * PostgreSQL (PostgreSQL License - OSI Approved) - relational
   database - Provides both traditional relational database and JSON
   object storage. In addition, we rely upon its built-in free text
   searching to quickly slice through the FDA data.

 * jQuery Datatables (MIT License) - Interactive table widget - jQuery
   provides general DOM and CSS manipulation. The Datatables plugin
   creates a highly polished and interactive table for information
   display, sorting, and paging.

 * Font Awesome (MIT License) - vector icons and font framework -
   Simplifies the iconography used in our single-page application.

 * Bootstrap (MIT License) - responsive layout - We use Bootstrap to
   reformat the page structure and individual widgets to support a
   variety of mobile and desktop configurations.

 * App.js (MIT License) - web widgets - Provides us a number of
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
### 24.0A Pool Three Evaluation Criteria and Evidence ###

While Attachment E provides more narrative and context, we have
provided a mapping of each evaluation criteria with its evidence here
for convenience:

 * Assigned one leader, gave that person authority and responsibility,
   and held that person accountable for the quality of the prototype
   submitted
   * Project Charter in "docs/management" 
   * Triage of development and user feedback issues in docs/tickets

 * Assembled a multidisciplinary and collaborative team including a
   minimum of 5 labor categories from the Development Pool labor
   categories to design and develop the prototype
   * Attachment C
   * Project Charter in "docs/management" 

 * Understand what people need, by including people in the prototype
   development and design process
   * Project Charter in "docs/management"
   * UX artifacts in "docs/ux"

 * Used at least three "human-centered design" techniques or tools
   * UX artifacts in "docs/ux"

 * Created or used a design style guide and/or a pattern library
   * [Style Guide](http://18fchallenge.tcg.com/style-guide.html) 

 * Performed usability tests with people
   * "Focus Group Notes..." in "docs/ux"
   * User acceptance issue/enhancement reports in "docs/tickets" 
   * Redmine development tickets in "docs/tickets" 

 * Used an iterative approach, where feedback informed subsequent work
   or versions of the prototype
   * See previous bullet.  

 * Created a prototype that works on multiple devices, and presents a
   responsive design
   * User acceptance issue/enhancement reports in "docs/tickets" 
   * CSS in "public/css" and index.html 

 * Used at least five modern and open-source technologies, regardless
   of architectural layer (frontend, backend, etc.)
   * See previous "Architecture" section in this readme. 

 * Deployed the prototype on an Infrastructure as a Service (IaaS) or
   Platform as a Service (PaaS) provider, and indicated which provider
   they used
   * See "Use of IaaS" below.  

 * Wrote unit tests for their code
   * Screenshots in "docs/evidence"
   * Tests in "tests" 

 * Set up or used a continuous integration system to automate the
   running of tests and continuously deployed their code to their IaaS
   or PaaS provider
   * Screenshots and Jenkins config in "docs/evidence" 

 * Set up or used configuration management
   * [This project in Github](https://github.com/TCGInc/gsachallenge)

 * Set up or used continuous monitoring
   * Nagios and fail2ban screenshots in "docs/evidence" 

 * Deploy their software in a container (i.e., utilized
   operating-system-level virtualization)
   * "docker" file in repository

 * Provided sufficient documentation to install and run their
   prototype on another machine
   * "Installation_and_API_Notes.md" in root

 * Prototype and underlying platforms used to create and run the
   prototype are openly licensed and free of charge
   * See "Public Domain" below
   * See previous "Architecture" section

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
in our "docs/us_digital_services_playbook_mapping" folder. 

## Public Domain ##

This project is in the worldwide [public domain](LICENSE.md).

This project is in the public domain within the United States, and
copyright and related rights in the work worldwide are waived through
the [CC0 1.0 Universal public domain
dedication](https://creativecommons.org/publicdomain/zero/1.0/).