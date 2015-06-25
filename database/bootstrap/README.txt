######################################################################################
#
#  Scripts in this directory provide utilities for loading
#  and creating fda enforcement data to US State normalization.
#   
#   Files:
#      fdaSchema.sql - creates the postgres schema
#      fdaApiDataLoader.pl - updates or constructs db content from fda API
#      fdaApiDataLoaderfromDateFile.pl - updates db explicitly from known dates (good for bootstrap)
#      fdaApiDates_All.txt - named dates containing events
#      fdaApiDates.txt -  runtime date list used by fdaApiDataLoaderfromDateFile
#      normalizStatesOneRecall.pl - file called to normalizd pattern_distribution for one recall
#      normalizeStates.pl - file that will re-normalize entire DB.  Useful for adding normalization rules
#   
#   
#Requires:
#--  sudo apt-get install libdbd-pg-perl
#--  sudo apt-get install libxml-simple-perl
#--  sudo apt-get install libjson-pp-perl
#--  sudo apt-get install libdatetime-perl  
#######################################################################################
    
General Instructions:

0.  ensure your environment has the PERL apt-get packages and CURL installed

1.  pull repo and navigate to  /database/bootstrap/

2.  run:  perl fdaApiDataLoaderfromDateFile.pl
           
     -this will run for about 30 minutes.  
     -note, this file reads "fdaApiDates.txt" for target event report_date
DONE     

     
Notes:

Rerunning 2 will effectively refresh data for each date.

Auto Refresh Setup:  Run CRON job for fdaApiDataLoader.pl with NO parameters                     

    Running:  fdaApiDataLoader.pl will do the following:
          ARG0 = NULL ->  starting today:
				examine DB to determine if records exist, if so exit program
				scan FDA for records, if exist -> populate DB
				repeat for currentDay minus one day	  
	  ARG0 = date in format:  YYYYMMDD -> starting today
	  			if day < ARG0 exit program
	  			scan FDA for records, if they exist
				remove existing DB records, replace with new
				repeat for today minus one day


