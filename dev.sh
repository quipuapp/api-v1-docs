#!/bin/env bash

docker run -p 4455:4455 $(docker build -q .)
