#!/bin/bash

docker logs `docker ps -f name=aguasoft_aguasoft -ql` -f
