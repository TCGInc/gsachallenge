CREATE TABLE filters
(
  name text NOT NULL,
  description text,
  id serial NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  from_date date,
  to_date date,
  include_food boolean,
  include_drugs boolean,
  include_devices boolean,
  product_description text,
  reason_for_recall text,
  recalling_firm text,
  include_class1 boolean,
  include_class2 boolean,
  include_class3 boolean,
  CONSTRAINT filters_pk PRIMARY KEY (id),
  CONSTRAINT uniq_name UNIQUE (name)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE filters
  OWNER TO gsac;
