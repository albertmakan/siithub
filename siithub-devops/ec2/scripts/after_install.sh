#!/bin/bash
cd /home/ubuntu/siithub/siithub-devops/ec2
docker-compose build
docker image prune -f
