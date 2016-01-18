#!/bin/sh

script_dir="`cd $(dirname $0); pwd`"

docker run \
  --rm \
  -v $script_dir/../..:/usr/src/ITKAnisotropicDiffusionLBR \
    insighttoolkit/anisotropicdiffusionlbr-test \
      /usr/src/ITKAnisotropicDiffusionLBR/test/Docker/test.sh
