#!/bin/sh

script_dir="`cd $(dirname $0); pwd`"

docker build -t insighttoolkit/anisotropic-diffusion-lbr-test $script_dir
