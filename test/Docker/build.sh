#!/bin/sh

script_dir="`cd $(dirname $0); pwd`"

docker build -t insighttoolkit/anisotropicdiffusionlbr-test $script_dir
