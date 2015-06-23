#!/usr/bin/perl
#--  sudo apt-get install libdbd-pg-perl
use strict;
use DBI;
my $sqlStr = "";
my $repDate = "";

my $dbh = DBI->connect('dbi:Pg:dbname=gsac;host=localhost','gsac','gsac123',{AutoCommit=>1,RaiseError=>1,PrintError=>0});
#clear out old
$dbh->do("delete from fda_enforcement_states;");
my $s = $dbh->prepare("select distinct(report_date)rd from fda_enforcement_events");
$s->execute;
while(my $row =  $s->fetchrow_hashref()) {  
  $repDate = $row->{'rd'};
  #print "report date is $row->{'rd'}\n";

  $sqlStr = "insert into FDA_ENFORCEMENT_STATES (STATES_ID,FDA_ENFORCEMENT_EVENTS_ID)
	     (select a.ID, b.ID from STATES a, FDA_ENFORCEMENT_EVENTS b 
	     where 
	     (exists (select 'a' from FDA_ENFORCEMENT_EVENTS c where c.recall_number=b.recall_number and c.distribution_pattern like '%'||a.State_Abbr||'%')
	     OR
	     exists (select 'a' from FDA_ENFORCEMENT_EVENTS c where c.recall_number=b.recall_number and c.distribution_pattern like '%'||a.State_Name||'%'))
             and b.report_date='$repDate');";  
  $dbh->do($sqlStr);
}

print "Data normalization complete\n";