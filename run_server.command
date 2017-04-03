#!/bin/bash

cd `dirname $0`
echo "Starting server. Type Control-C to exit"
python -m SimpleHTTPServer
