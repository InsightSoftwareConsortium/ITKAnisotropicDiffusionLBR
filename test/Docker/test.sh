#!/bin/bash

# This is a script to build the modules and run the test suite in the base
# Docker container.

die() {
  echo "Error: $@" 1>&2
  exit 1;
}

cd /usr/src/ITKAnisotropicDiffusionLBR || die "Could not cd into the source directory"
revision=$(git rev-parse --short HEAD)

cd /usr/src/ITKAnisotropicDiffusionLBR-build || die "Could not cd into the build directory"

cmake \
  -G Ninja \
  -DITK_DIR:PATH=/usr/src/ITK-build \
  -DCMAKE_BUILD_TYPE:STRING=Release \
  -DBUILDNAME:STRING="External-AnisotropicDiffusionLBR-${revision}" \
    /usr/src/ITKAnisotropicDiffusionLBR || die "CMake configuration failed"
ctest -VV -D Experimental || die "ctest failed"
