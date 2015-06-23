#!/usr/bin/perl

#--  sudo apt-get install libdbd-pg-perl
#--  sudo apt-get install libxml-simple-perl
#--  sudo apt-get install libjson-pp-perl

use strict;
use DBI;
use Data::Dumper;
use JSON qw(decode_json);
my $dateFile = "fdaApiDates.txt";
my $apiKey = "P4LId5FkY815FuYjWr9d3gvAAzauENhPK9N5foOT";
my $recCnt = 50;
my $skipCnt = 0;
my $innerCnt = 0;
my $totalCnt = 0;
my $tUrl = "https://api.fda.gov/ETYPE/enforcement.json?api_key=$apiKey&search=report_date:\"TARGETDATE\"&limit=$recCnt&skip=SKIPCNT";
my $workingStr;
my $ctStr;
my $fName;
my @args;
my @pargs;
my @eTypes = ("food","drug","device");
my $clearedEvents;
my $dbh = DBI->connect('dbi:Pg:dbname=gsac;host=localhost','gsac','gsac123',{AutoCommit=>1,RaiseError=>1,PrintError=>0});
my $sqlDelStr = "delete from fda_enforcement_events where recall_number =";
my $sqlDelStates = "delete from fda_enforcement_states where fda_enforcement_events_id in
                              (select id from fda_enforcement_events WHERE recall_number=";
my $sqlStr = ""; 

#CURL call
$ctStr = "curl \"$tUrl\" -s --output TARGETDATE.json -H \"Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8\" --compressed";

#subs
sub replace {
      my ($from,$to,$string) = @_;
      $string =~s/$from/$to/ig;                          #case-insensitive/global (all occurrences)
      return $string;
   }
 sub getLoggingTime {

     my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst)=localtime(time);
     my $nice_timestamp = sprintf ( "%02d/%02d/%04d %02d:%02d:%02d",
                                    $mon+1,$mday,$year+1900,$hour,$min,$sec);
     return $nice_timestamp;
 }
 sub printTime{
    my $tm = getLoggingTime;
    print "$tm\n";
}
##end subs


#for each date....
printTime

open FILE, "<$dateFile" or die $!;
  my @fileLines = <FILE>;
close FILE;

foreach(@fileLines)
{
	my $tdate = $_;
	$tdate =~ s/[\r\n]//g;
        print getLoggingTime()." Working date name is $tdate\n";
 	$clearedEvents = 0;
	  
	
	#repeat this 3 time for the type
	
	foreach my $eType (@eTypes)
	{
		$skipCnt = 0;
		do
		{
			$innerCnt = 0;
			$workingStr=$ctStr;
			$workingStr =~ s/TARGETDATE/$tdate/g;  
			$workingStr =~ s/SKIPCNT/$skipCnt/;
			$workingStr =~ s/ETYPE/$eType/;
			#print $workingStr;
			@args = ($workingStr);
			    system(@args)==0 or die "error on curl: $?";
			 $fName = $tdate.".json";
			 if(-e $fName)
			 {
				my $json_text = do {
				      open(my $json_fh, $fName)
					 or die("Can't open \$filename\": $!\n");
				      local $/;
				      <$json_fh>
				  };
				my $data = decode_json($json_text);
				my  $recalls = $data->{'results'};
				for my $recall (@$recalls)
				{

					#print "clearing existing events for $recall->{'recall_number'}\n";
					$dbh->do($sqlDelStates."'".$recall->{'recall_number'}."')");
					$dbh->do($sqlDelStr."'".$recall->{'recall_number'}."'");

					#load this record...
					$sqlStr = "insert into FDA_ENFORCEMENT_EVENTS
							(Product_Type,
							Event_ID,
							Status,
							Recalling_Firm,
							City,
							State,
							Country,
							Voluntary_Mandated,
							Initial_Firm_Notification_of_Consignee_or_Public,
							Distribution_Pattern,
							Recall_Number,
							Classification,
							Product_Description,
							Code_Info,
							Code_Info_Continued,
							Product_Quantity,
							Reason_for_Recall,
							Recall_Initiation_Date,
							Report_Date)
							values
							 ('$recall->{'product_type'}',
							 '$recall->{'event_id'}',
							 '$recall->{'status'}',
							 '".replace("'","''",$recall->{'recalling_firm'})."',
							 '".replace("'","''",$recall->{'city'})."',
							 '".replace("'","''",$recall->{'state'})."',
							 '".replace("'","''",$recall->{'country'})."',
							 '$recall->{'voluntary_mandated'}',
							 '$recall->{'initial_firm_notification'}',
							 '".replace("'","''",$recall->{'distribution_pattern'})."',
							 '$recall->{'recall_number'}',
							 '$recall->{'classification'}',
							 '".replace("'","''",$recall->{'product_description'})."',
							 '".replace("'","''",$recall->{'code_info'})."',
							 '".replace("'","''",$recall->{'code_info'})."',
							 '".replace("'","''",$recall->{'product_quantity'})."',
							 '".replace("'","''",$recall->{'reason_for_recall'})."',
							 '$recall->{'recall_initiation_date'}',
							 '$recall->{'report_date'}'
							  );";


				     #print "\n $sqlStr \n";
					 $dbh->do($sqlStr);

					#update the state reference....
					@pargs = ("perl","normalizeStatesOneRecall.pl",$recall->{'recall_number'});
					     system(@pargs)==0 or die "error on normalization call: $?\n";


					$innerCnt++;
					$totalCnt++;
					#print "Recall state = $recall->{'state'}\n";
				}
				 print getLoggingTime()."  done block, inserted $innerCnt rows for date $tdate for $eType\n";
			 }
			 else
			 {
			    print "No file found for date $tdate\n";
			 }
			 $skipCnt = $skipCnt + $recCnt;
		 } until ($innerCnt==0)
	 } #end etypes	 
} #end date
 print getLoggingTime()."done all, total count = $totalCnt\n";


