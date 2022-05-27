#!/usr/bin/env bash
set -e
no_cache="--no-cache"
tag=week12
sudo docker build $no_cache -t springulum/backend:$tag .
cd react-frontend
sudo docker build $no_cache -t springulum/frontend:$tag .
