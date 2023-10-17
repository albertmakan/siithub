#!/bin/bash
DIR="/home/ubuntu/siithub"
if [ -d "$DIR" ]; then
  echo "${DIR} exists"
else
  echo "Creating ${DIR} directory"
  mkdir ${DIR}
fi
docker image prune -f
