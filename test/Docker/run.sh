#!/bin/sh

script_dir="`cd $(dirname $0); pwd`"

docker run \
  --rm \
  -v $script_dir/../..:/usr/src/ITKAnisotropicDiffusionLBR \
    insighttoolkit/anisotropic-diffusion-lbr-test \
      /usr/src/ITKAnisotropicDiffusionLBR/test/Docker/test.sh
