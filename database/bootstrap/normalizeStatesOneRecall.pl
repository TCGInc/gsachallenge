#!/usr/bin/perl
#--  sudo apt-get install libdbd-pg-perl
use strict;
use DBI;
my $sqlStr = "";

my $recallNumber = $ARGV[0];
my $sqlDelStates = "delete from fda_enforcement_states where fda_enforcement_events_id in
                              (select id from fda_enforcement_events WHERE recall_number=$recallNumber";
                              
my $dbh = DBI->connect('dbi:Pg:dbname=gsac;host=localhost','gsac','gsac123',{AutoCommit=>1,RaiseError=>1,PrintError=>0});
#clear out old


$sqlStr ="insert into FDA_ENFORCEMENT_STATES (STATES_ID,FDA_ENFORCEMENT_EVENTS_ID)
	     (select a.ID, b.ID from STATES a, FDA_ENFORCEMENT_EVENTS b 
	     where 
	     (exists (select 'a' from FDA_ENFORCEMENT_EVENTS c where c.recall_number=b.recall_number and c.distribution_pattern like '%'||a.State_Abbr||'%')
	     OR
	     exists (select 'a' from FDA_ENFORCEMENT_EVENTS c where c.recall_number=b.recall_number and c.distribution_pattern like '%'||a.State_Name||'%'))
	     and b.recall_number='".$recallNumber."');";

	     $dbh->do($sqlStr);
	     
#print "Data normalization complete for $recallNumber\n";
