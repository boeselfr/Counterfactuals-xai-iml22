#!/usr/bin/env bash
set -e
tag=week10
sudo docker push springulum/backend:$tag
sudo docker push springulum/frontend:$tag
