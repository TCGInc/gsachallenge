****************************************

Instructions for running data updates


****************************************


pre-requisits:

  Perl +
  #--  sudo apt-get install libdbd-pg-perl
  #--  sudo apt-get install libxml-simple-perl
  #--  sudo apt-get install libjson-pp-perl

  curl
  
  
***

1.  pull repo and navigate to  /database/bootstrap/

2.  run:
     perl fdaApiDataLoader.pl
     
     -this will run for about 30 minutes.  
      and it will perform a basic data normalization
      
3.  run:
     perl normalizeStates.pl
     
     -this will run for about 20 secondes.  complete normalization