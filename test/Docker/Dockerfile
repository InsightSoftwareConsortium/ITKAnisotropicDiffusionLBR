FROM debian:8
MAINTAINER Insight Software Consortium <community@itk.org>

# Faster and more reliable package repository
RUN REPO=http://cdn-fastly.deb.debian.org && \
  echo "deb $REPO/debian jessie main\ndeb $REPO/debian jessie-updates main\ndeb $REPO/debian-security jessie/updates main" > /etc/apt/sources.list

RUN apt-get update && apt-get install -y \
  build-essential \
  curl \
  cmake \
  git \
  libexpat1-dev \
  libhdf5-dev \
  libjpeg-dev \
  libpng12-dev \
  libtiff5-dev \
  ninja-build \
  python \
  wget \
  vim \
  zlib1g-dev

WORKDIR /usr/src

# ITK master 2017-03-29
ENV ITK_GIT_TAG ebe31b65006ec6d5658e004559af1cbb56494eb2
RUN git clone --depth 1 https://itk.org/ITK.git && \
  cd ITK && \
  git checkout ${ITK_GIT_TAG} && \
  cd ../ && \
  mkdir ITK-build && \
  cd ITK-build && \
  cmake \
    -G Ninja \
    -DCMAKE_INSTALL_PREFIX:PATH=/usr \
    -DBUILD_EXAMPLES:BOOL=OFF \
    -DBUILD_TESTING:BOOL=OFF \
    -DBUILD_SHARED_LIBS:BOOL=ON \
    -DCMAKE_POSITION_INDEPENDENT_CODE:BOOL=ON \
    -DITK_LEGACY_REMOVE:BOOL=ON \
    -DITK_BUILD_DEFAULT_MODULES:BOOL=OFF \
    -DITK_USE_SYSTEM_LIBRARIES:BOOL=ON \
    -DModule_ITKIOImageBase:BOOL=ON \
    -DModule_ITKIOSpatialObjects:BOOL=ON \
    -DModule_ITKMetaIO:BOOL=ON \
    -DModule_ITKImageGradient:BOOL=ON \
    -DModule_ITKTestKernel:BOOL=ON \
    ../ITK && \
  ninja && \
  find . -name '*.o' -delete

RUN mkdir -p /usr/src/ITKAnisotropicDiffusionLBR-build
