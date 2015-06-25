Utility queries:

select states_id, fda_enforcement_events_id, count(states_id) from fda_enforcement_states
group by states_id, fda_enforcement_events_id
having count(states_id) > 1
order by 3 desc


delete from fda_enforcement_states where fda_enforcement_events_id in
                              (select id from fda_enforcement_events WHERE report_date='2015-05-20');
delete from fda_enforcement_events WHERE report_date='2015-05-20';



select a.ID, b.ID from STATES a, FDA_ENFORCEMENT_EVENTS b 
	     where 
	     not exists (select 'a' from FDA_ENFORCEMENT_EVENTS c where c.recall_number=b.recall_number and split_part(c.distribution_pattern,'except',2) like '%'||a.State_Abbr||'%')	     
	     and not exists (select 'a' from fda_enforcement_states d where d.fda_enforcement_events_id=b.id)
		and b.distribution_pattern like '%except%'
		and b.distribution_pattern not like '%Whole Foods%'
		       and b.report_date='2012-01-01'



select c, x.dp, split_part(x.dp,'except',1) as in, split_part(x.dp,'except',2) as out  from
(select count('a') c, a.distribution_pattern dp
from
fda_enforcement_events a
where not exists (select 'a' from fda_enforcement_states b where b.fda_enforcement_events_id=a.id)
group by a.distribution_pattern) x
order by 2;





select count('a'), a.distribution_pattern 
from
fda_enforcement_events a
where 2=2
and not exists (select 'a' from fda_enforcement_states b where b.fda_enforcement_events_id=a.id)
and 
(
	a.distribution_pattern in
	('US',
	'Naitonwide',
	'Nationwie',
	'US only',
	'Natiowide and Canada',
	'USA Nationawide Distribution')
	
	OR lower(a.distribution_pattern) like ('us distribution%')
	OR a.distribution_pattern like ('US.%')
	OR a.distribution_pattern like ('US,%')
	OR a.distribution_pattern like ('U.S.%')
	OR a.distribution_pattern like ('US and%')
	OR a.distribution_pattern like ('US states%')
	OR a.distribution_pattern like ('USA%')
	OR a.distribution_pattern like ('USA and%')
	OR a.distribution_pattern like ('United States%')
	OR replace(lower(a.distribution_pattern),'.','') like ('%throughout the us%')
	OR replace(lower(a.distribution_pattern),'.','') like ('%distribution in us%')

	OR lower(a.distribution_pattern) like ('%distributed in the us%')
	OR lower(a.distribution_pattern) like ('%natiowide to us states%')
	OR a.distribution_pattern like ('%Distributed to all 50 states%')
	OR a.distribution_pattern like ('National distribution%')
	OR replace(lower(a.distribution_pattern),' ','') like ('nationwide%')
	OR replace(lower(a.distribution_pattern),' ','') like ('nationally%')
	OR a.distribution_pattern like ('Natiowide%')
		
	OR replace(lower(a.distribution_pattern),'.','') like ('%distributed to us%')
	OR replace(lower(a.distribution_pattern),'.','') like ('%all states in the us%')
)
and a.distribution_pattern not like ('%except%')
group by a.distribution_pattern
order by 2;








