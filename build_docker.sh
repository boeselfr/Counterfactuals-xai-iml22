#!/usr/bin/env bash
set -e
tag=test
sudo docker build -t springulum/backend:$tag .
cd react-frontend
sudo docker build -t springulum/frontend:$tag .

