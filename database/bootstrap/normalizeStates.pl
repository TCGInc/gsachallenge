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

  #basic States
  $sqlStr = "insert into FDA_ENFORCEMENT_STATES (STATES_ID,FDA_ENFORCEMENT_EVENTS_ID)
	     (select a.ID, b.ID from STATES a, FDA_ENFORCEMENT_EVENTS b 
	     where 
	     (exists (select 'a' from FDA_ENFORCEMENT_EVENTS c where c.recall_number=b.recall_number and c.distribution_pattern like '%'||a.State_Abbr||'%')
	     OR
	     exists (select 'a' from FDA_ENFORCEMENT_EVENTS c where c.recall_number=b.recall_number and c.distribution_pattern like '%'||a.State_Name||'%'))
             	     and b.distribution_pattern not like '%except%'             
		     and LOWER(b.distribution_pattern) not like '%nationwide%'
		     and LOWER(b.distribution_pattern) not like '%worldwide%'
		       and b.report_date='$repDate');";  
        $dbh->do($sqlStr);

  #simple nation wide
  $sqlStr = "insert into FDA_ENFORCEMENT_STATES (STATES_ID,FDA_ENFORCEMENT_EVENTS_ID)
	     (select a.ID, b.ID from STATES a, FDA_ENFORCEMENT_EVENTS b 
		     where 
		     LOWER(b.distribution_pattern) like '%nationwide%'
		     and b.distribution_pattern not like '%except%' 
		      and b.report_date='$repDate');";  
        $dbh->do($sqlStr);

  #simple worldwide
  $sqlStr = "insert into FDA_ENFORCEMENT_STATES (STATES_ID,FDA_ENFORCEMENT_EVENTS_ID)
	     (select a.ID, b.ID from STATES a, FDA_ENFORCEMENT_EVENTS b  
		     where 
		     LOWER(b.distribution_pattern)  like '%worldwide%'
		     and b.distribution_pattern not like '%except%' 
		     and b.report_date='$repDate');";  
        $dbh->do($sqlStr);


  #nationwide variations
  $sqlStr = "insert into FDA_ENFORCEMENT_STATES (STATES_ID,FDA_ENFORCEMENT_EVENTS_ID)
	     (select a.ID, b.ID from STATES a, FDA_ENFORCEMENT_EVENTS b 
	where 2=2
	and not exists (select 'a' from fda_enforcement_states c where c.fda_enforcement_events_id=b.id)
	and 
	(
		b.distribution_pattern in
			('US',
			'Naitonwide',
			'Nationwie',
			'US only',
			'Natiowide and Canada',
			'USA Nationawide Distribution')

		OR lower(b.distribution_pattern) like ('us distribution%')
		OR b.distribution_pattern like ('US.%')
		OR b.distribution_pattern like ('US,%')
		OR b.distribution_pattern like ('U.S.%')
		OR b.distribution_pattern like ('US and%')
		OR b.distribution_pattern like ('US states%')
		OR b.distribution_pattern like ('USA%')
		OR b.distribution_pattern like ('USA and%')
		OR b.distribution_pattern like ('United States%')
		OR replace(lower(b.distribution_pattern),'.','') like ('%throughout the us%')
		OR replace(lower(b.distribution_pattern),'.','') like ('%distribution in us%')

		OR replace(lower(b.distribution_pattern),'.','') like ('%distributed to us%')
		OR replace(lower(b.distribution_pattern),'.','') like ('%all states in the us%')
		OR lower(b.distribution_pattern) like ('%distributed in the us%')
		OR lower(b.distribution_pattern) like ('%natiowide to us states%')
		OR b.distribution_pattern like ('%Distributed to all 50 states%')
		OR b.distribution_pattern like ('%all 50 U.S. States%')
		OR b.distribution_pattern like ('National distribution%')
		OR replace(lower(b.distribution_pattern),' ','') like ('nationwide%')
		OR replace(lower(b.distribution_pattern),' ','') like ('nationally%')
		OR b.distribution_pattern like ('Natiowide%')


	)
	and b.distribution_pattern not like ('%except%')
	and b.report_date='$repDate');";  
	$dbh->do($sqlStr);

	#nationwide except some states
        $sqlStr = "insert into FDA_ENFORCEMENT_STATES (STATES_ID,FDA_ENFORCEMENT_EVENTS_ID)
	     (select a.ID, b.ID from STATES a, FDA_ENFORCEMENT_EVENTS b 
	     where 
	     not exists (select 'a' from FDA_ENFORCEMENT_EVENTS c where c.recall_number=b.recall_number and split_part(c.distribution_pattern,'except',2) like '%'||a.State_Abbr||'%')	     
	     and not exists (select 'a' from fda_enforcement_states d where d.fda_enforcement_events_id=b.id)
		and b.distribution_pattern like '%except%'
		and b.distribution_pattern not like '%Whole Foods%'
		and b.report_date='$repDate');";
		
		
	 $dbh->do($sqlStr);


}

print "Data normalization complete\n";