#!/bin/bash

echo "Creating node source ball"
tar -cf gsac.tar --exclude='../../gsac/docker' ../../gsac/
sudo docker build -t gsachallenge .
