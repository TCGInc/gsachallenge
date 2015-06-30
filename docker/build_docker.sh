#!/bin/bash

echo "Creating node source ball"
tar -cf gsac.tar --exclude='../docker' ../*
echo "Building gsachallenge docker image"
sudo docker build -t gsachallenge .
