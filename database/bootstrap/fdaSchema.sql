
--
--
--  
--  sudo apt-get install libdbd-pg-perl
--  sudo apt-get install libxml-simple-perl
--
--
--
DROP VIEW v_state_enforcements;
DROP TABLE fda_enforcement_states;

DROP TABLE states;

DROP INDEX product_type_index;

DROP INDEX recall_number_index;

DROP TABLE public.fda_enforcement_events;

CREATE TABLE public.fda_enforcement_events
(
   id serial, 
	Product_Type text,
	Event_ID text,
	Status text,
	Recalling_Firm text,
	City text,
	State text,
	Country text,
	Voluntary_Mandated text,
	Initial_firm_Notification_of_Consignee_or_Public text,
	Distribution_Pattern text,
	Recall_Number text,
	Classification text,
	Product_Description text,
	Code_Info text,
	Code_info_Continued text,
	Product_Quantity text,
	Reason_for_Recall text,
	Recall_initiation_Date date,
	Report_Date date,
   CONSTRAINT fee_pk PRIMARY KEY (id)
) 
WITH (
  OIDS = FALSE
)
;
ALTER TABLE public.fda_enforcement_events
  OWNER TO gsac;

CREATE INDEX product_type_index
  ON fda_enforcement_events
  USING btree
  (product_type COLLATE pg_catalog.default);

CREATE INDEX recall_number_index
  ON fda_enforcement_events
  USING btree
  (recall_number COLLATE pg_catalog.default);

CREATE INDEX Recall_initiation_Date_index
   ON fda_enforcement_events (Recall_initiation_Date ASC NULLS LAST);
   
CREATE INDEX Report_Date_index
   ON fda_enforcement_events (report_date ASC NULLS LAST);

CREATE INDEX Product_Description_index
  ON fda_enforcement_events
  USING btree
  (Product_Description COLLATE pg_catalog.default);

CREATE INDEX Reason_for_Recall_index
  ON fda_enforcement_events
  USING btree
  (Reason_for_Recall COLLATE pg_catalog.default);




CREATE TABLE public.states
(
   id serial, 
	State_Name text,
	State_Abbr text,	
   CONSTRAINT state_pk PRIMARY KEY (id)
) 
WITH (
  OIDS = FALSE
)
;
ALTER TABLE public.states
  OWNER TO gsac;


CREATE INDEX state_name_index
  ON states
  USING btree
  (State_Name COLLATE pg_catalog.default);

CREATE INDEX state_abbr_index
  ON states
  USING btree
  (State_Abbr COLLATE pg_catalog.default);




CREATE TABLE public.fda_enforcement_states
(
   id serial, 
	states_id INTEGER,
	fda_enforcement_EVENTS_id INTEGER,	
   CONSTRAINT fda_enforcement_STATES_pk PRIMARY KEY (id)
) 
WITH (
  OIDS = FALSE
)
;
ALTER TABLE public.fda_enforcement_states
  OWNER TO gsac;

ALTER TABLE fda_enforcement_states
  ADD CONSTRAINT enforcment_id_fk FOREIGN KEY (fda_enforcement_EVENTS_id) REFERENCES fda_enforcement_events (id)
   ON UPDATE NO ACTION ON DELETE NO ACTION;
CREATE INDEX enforcment_id_idx
  ON fda_enforcement_states(fda_enforcement_EVENTS_id);

ALTER TABLE fda_enforcement_states
  ADD CONSTRAINT states_id_fk FOREIGN KEY (states_id) REFERENCES states (id)
   ON UPDATE NO ACTION ON DELETE NO ACTION;
CREATE INDEX states_id_idx
  ON fda_enforcement_states(states_id);

--One view
create or replace view v_state_enforcements
as
select a.*, State_Abbr, State_Name 
from
fda_enforcement_events a, fda_enforcement_states b, states c
where a.id = b.fda_enforcement_EVENTS_id and b.states_id=c.id;


--LOAD THE STATES
INSERT INTO states(State_Name, State_Abbr) values ('Alabama','AL');
INSERT INTO states(State_Name, State_Abbr) values ('Alaska','AK');
INSERT INTO states(State_Name, State_Abbr) values ('Arizona','AZ');
INSERT INTO states(State_Name, State_Abbr) values ('Arkansas','AR');
INSERT INTO states(State_Name, State_Abbr) values ('California','CA');
INSERT INTO states(State_Name, State_Abbr) values ('Colorado','CO');
INSERT INTO states(State_Name, State_Abbr) values ('Connecticut','CT');
INSERT INTO states(State_Name, State_Abbr) values ('Delaware','DE');
INSERT INTO states(State_Name, State_Abbr) values ('Florida','FL');
INSERT INTO states(State_Name, State_Abbr) values ('Georgia','GA');
INSERT INTO states(State_Name, State_Abbr) values ('Hawaii','HI');
INSERT INTO states(State_Name, State_Abbr) values ('Idaho','ID');
INSERT INTO states(State_Name, State_Abbr) values ('Illinois','IL');
INSERT INTO states(State_Name, State_Abbr) values ('Indiana','IN');
INSERT INTO states(State_Name, State_Abbr) values ('Iowa','IA');
INSERT INTO states(State_Name, State_Abbr) values ('Kansas','KS');
INSERT INTO states(State_Name, State_Abbr) values ('Kentucky','KY');
INSERT INTO states(State_Name, State_Abbr) values ('Louisiana','LA');
INSERT INTO states(State_Name, State_Abbr) values ('Maine','ME');
INSERT INTO states(State_Name, State_Abbr) values ('Maryland','MD');
INSERT INTO states(State_Name, State_Abbr) values ('Massachusetts','MA');
INSERT INTO states(State_Name, State_Abbr) values ('Michigan','MI');
INSERT INTO states(State_Name, State_Abbr) values ('Minnesota','MN');
INSERT INTO states(State_Name, State_Abbr) values ('Mississippi','MS');
INSERT INTO states(State_Name, State_Abbr) values ('Missouri','MO');
INSERT INTO states(State_Name, State_Abbr) values ('Montana','MT');
INSERT INTO states(State_Name, State_Abbr) values ('Nebraska','NE');
INSERT INTO states(State_Name, State_Abbr) values ('Nevada','NV');
INSERT INTO states(State_Name, State_Abbr) values ('New Hampshire','NH');
INSERT INTO states(State_Name, State_Abbr) values ('New Jersey','NJ');
INSERT INTO states(State_Name, State_Abbr) values ('New Mexico','NM');
INSERT INTO states(State_Name, State_Abbr) values ('New York','NY');
INSERT INTO states(State_Name, State_Abbr) values ('North Carolina','NC');
INSERT INTO states(State_Name, State_Abbr) values ('North Dakota','ND');
INSERT INTO states(State_Name, State_Abbr) values ('Ohio','OH');
INSERT INTO states(State_Name, State_Abbr) values ('Oklahoma','OK');
INSERT INTO states(State_Name, State_Abbr) values ('Oregon','OR');
INSERT INTO states(State_Name, State_Abbr) values ('Pennsylvania','PA');
INSERT INTO states(State_Name, State_Abbr) values ('Rhode Island','RI');
INSERT INTO states(State_Name, State_Abbr) values ('South Carolina','SC');
INSERT INTO states(State_Name, State_Abbr) values ('South Dakota','SD');
INSERT INTO states(State_Name, State_Abbr) values ('Tennessee','TN');
INSERT INTO states(State_Name, State_Abbr) values ('Texas','TX');
INSERT INTO states(State_Name, State_Abbr) values ('Utah','UT');
INSERT INTO states(State_Name, State_Abbr) values ('Vermont','VT');
INSERT INTO states(State_Name, State_Abbr) values ('Virginia','VA');
INSERT INTO states(State_Name, State_Abbr) values ('Washington','WA');
INSERT INTO states(State_Name, State_Abbr) values ('West Virginia','WV');
INSERT INTO states(State_Name, State_Abbr) values ('Wisconsin','WI');
INSERT INTO states(State_Name, State_Abbr) values ('Wyoming','WY');