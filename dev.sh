#!/bin/env bash

docker run -p 4455:4455 -v $PWD:/app $(docker build -q .)
