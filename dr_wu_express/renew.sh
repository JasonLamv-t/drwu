#!/bin/bash
docker rm -f drwu-express
docker build -t drwu-express .
docker run -d --name drwu-express -p 3000:3000 --restart=always drwu-express
docker rmi $(docker images | grep "none" | awk '{print $3}')