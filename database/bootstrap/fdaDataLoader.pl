#!/usr/bin/perl

#--  sudo apt-get install libdbd-pg-perl
#--  sudo apt-get install libxml-simple-perl

use DBI;
use XML::Simple;
use Data::Dumper;

my $pargs;

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



$xml = XML::Simple->new();

my $dbh = DBI->connect('dbi:Pg:dbname=gsac;host=localhost','gsac','gsac123',{AutoCommit=>1,RaiseError=>1,PrintError=>0});
print "2+2=",$dbh->selectrow_array("SELECT 2+2"),"\n";

#open a csv file or URLs...
#curl a date to get the file.....
#open the file, parse it for the rows and load the db.

my $tdate = 12312014;
my $ctStr = "curl \"http://www.accessdata.fda.gov/scripts/enforcement/enforce_rpt-Product-Tabs.cfm?xml&w=TARGETDATE\" -s --output TARGETDATE.xml -H \"Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8\" --compressed";
my $workingStr;

#for each date....
printTime

open FILE, "<fdaDates.txt" or die $!;
my @fileLines = <FILE>;
close FILE;

foreach(@fileLines)
{
        my $tdate = $_;
        $tdate =~ s/[\r\n]//g;
         print getLoggingTime()." Working date name is $tdate\n";


        $workingStr=$ctStr;
        $workingStr =~ s/TARGETDATE/$tdate/g;

         @args = ($workingStr);
            system(@args)==0 or die "error on curl: $?";

         $fName = $tdate.".xml";


   if(-e $fName)
   {

        my $data = $xml->XMLin($fName);

        #print Dumper($data);


        my $sqlDelStr = "delete from FDA_ENFORCEMENT_EVENTS where recall_number =";
        my $sqlDelStates = "delete from FDA_ENFORCEMENT_STATES where FDA_ENFORCEMENT_EVENTS_ID in
                              (select ID from FDA_ENFORCEMENT_EVENTS WHERE recall_number=";
        my $sqlStr = "";
        my $iCount = 0;
        foreach my $recall (keys %{$data->{'recall-number'}})
        {
                #print "recall: $recall\n";
                # print "  report date = $data->{'recall-number'}->{$recall}->{'report-date'}\n";

          #load the data into the DB, assum blow away old record....
	       #print $sqlDelStates."'".$recall."')";
               $dbh->do($sqlDelStates."'".$recall."')");
               $dbh->do($sqlDelStr."'".$recall."'");

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
                 ('$data->{'recall-number'}->{$recall}->{'product-type'}',
                 '$data->{'recall-number'}->{$recall}->{'event-id'}',
                 '$data->{'recall-number'}->{$recall}->{'status'}',
                 '".replace("'","''",$data->{'recall-number'}->{$recall}->{'recalling-firm'})."',
                 '".replace("'","''",$data->{'recall-number'}->{$recall}->{'city'})."',
                 '".replace("'","''",$data->{'recall-number'}->{$recall}->{'state'})."',
                 '".replace("'","''",$data->{'recall-number'}->{$recall}->{'country'})."',
                 '$data->{'recall-number'}->{$recall}->{'voluntary-mandated'}',
                 '$data->{'recall-number'}->{$recall}->{'initial-firm-notification'}',
                 '".replace("'","''",$data->{'recall-number'}->{$recall}->{'distribution-pattern'})."',
                 '$recall',
                 '$data->{'recall-number'}->{$recall}->{'classification'}',
                 '".replace("'","''",$data->{'recall-number'}->{$recall}->{'product-description'})."',
                 '".replace("'","''",$data->{'recall-number'}->{$recall}->{'code-info'})."',
                 '".replace("'","''",$data->{'recall-number'}->{$recall}->{'code-info'})."',
                 '".replace("'","''",$data->{'recall-number'}->{$recall}->{'product-quantity'})."',
                 '".replace("'","''",$data->{'recall-number'}->{$recall}->{'reason-for-recall'})."',
                 '$data->{'recall-number'}->{$recall}->{'recall-initiation-date'}',
                 '$data->{'recall-number'}->{$recall}->{'report-date'}'
                  );";


             #print "\n $sqlStr \n";
             $iCount++;
             $dbh->do($sqlStr);
                          
	     #update the state reference....
	     @pargs = ("perl","normalizeStatesOneRecall.pl",$recall);
	        system(@pargs)==0 or die "error on normalization call: $?\n";                         
             
        }

      print getLoggingTime()."  done file, inserted $iCount rows for date $tdate\n";

  }
  else
  {
     print "No data for date $tdate\n";
  }

}
 print getLoggingTime()."done all\n";


