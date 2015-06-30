#!/bin/bash
/etc/init.d/postgresql start
cd /gsac; node index.js
