#!/bin/sh
export PORT=3000
export USER=aaaaa
export PASS=bbbbb
#export MONGODB=140.86.0.63:27017
#export MONGODB_USER=root
#export MONGODB_PASS=
export MONGODB=localhost:27017
export MONGODB_USER=console
export MONGODB_PASS=console1
nodemon server.js
