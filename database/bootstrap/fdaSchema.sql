
--
--
--  
--  sudo apt-get install libdbd-pg-perl
--  sudo apt-get install libxml-simple-perl
--
--
--
DROP VIEW IF EXISTS v_state_enforcements;
DROP TABLE IF EXISTS fda_enforcement_states;

DROP TABLE IF EXISTS states;

DROP INDEX IF EXISTS product_type_index;

DROP INDEX IF EXISTS recall_number_index;

DROP TABLE IF EXISTS fda_enforcement_events;

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

--CREATE INDEX Product_Description_index
--  ON fda_enforcement_events
--  USING gin
--  (Product_Description);

--CREATE INDEX Reason_for_Recall_index
--  ON fda_enforcement_events
--  USING gin
--  (Reason_for_Recall);




CREATE TABLE public.states
(
   id serial, 
	State_Name text,
	State_Abbr text,	
	Whole_Foods text,
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

CREATE INDEX state_whole_foods_index
  ON states
  USING btree
  (Whole_Foods COLLATE pg_catalog.default);


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

<<<<<<< HEAD
--States

INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Alabama','AL','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Alaska','AK','N');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Arizona','AZ','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Arkansas','AR','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('California','CA','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Colorado','CO','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Connecticut','CT','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('District of Columbia','DC','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Delaware','DE','N');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Florida','FL','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Georgia','GA','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Hawaii','HI','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Idaho','ID','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Illinois','IL','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Indiana','IN','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Iowa','IA','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Kansas','KS','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Kentucky','KY','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Louisiana','LA','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Maine','ME','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Maryland','MD','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Massachusetts','MA','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Michigan','MI','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Minnesota','MN','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Mississippi','MS','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Missouri','MO','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Montana','MT','N');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Nebraska','NE','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Nevada','NV','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('New Hampshire','NH','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('New Jersey','NJ','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('New Mexico','NM','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('New York','NY','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('North Carolina','NC','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('North Dakota','ND','N');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Ohio','OH','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Oklahoma','OK','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Oregon','OR','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Pennsylvania','PA','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Rhode Island','RI','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('South Carolina','SC','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('South Dakota','SD','N');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Tennessee','TN','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Texas','TX','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Utah','UT','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Vermont','VT','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Virginia','VA','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Washington','WA','Y');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('West Virginia','WV','N');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Wisconsin','WI','N');
INSERT INTO states(State_Name, State_Abbr,Whole_Foods) values ('Wyoming','WY','N');
=======
>>>>>>> 1a1c312d69ffadb7167c40bef5bcb3ddeefec9ff
