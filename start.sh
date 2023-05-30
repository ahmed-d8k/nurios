#!/usr/bin/env bash

sudo docker build -t cap .
sudo docker run -d --name cap-container -p 8080:8080 cap