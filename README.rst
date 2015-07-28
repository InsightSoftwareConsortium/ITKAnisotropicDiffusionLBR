Web page sources for ITKAnisotropicDiffusionLBR
===============================================

Build the Pages
---------------

First, clone the sources::

  cd ~/src/
  git clone http://itk.org/ITK.git
  cd Modules/External
  git clone https://github.com/InsightSoftwareConsortium/ITKAnisotropicDiffusionLBR.git
  cd ~/src
  git clone --branch gh-pages https://github.com/InsightSoftwareConsortium/ITKAnisotropicDiffusionLBR.git ITKAnisotropicDiffusionLBRWeb

Next, start up the docker container::

  docker pull thewtex/cross-compiler-browser-asmjs
  mkdir -p ~/bin/ITK-build
  mkdir -p ~/bin/ITKAnisotropicDiffusionLBRWeb-build
  docker run --rm -it --name diffusion \
    -v ~/src/ITK:/usr/src/ITK \
    -v ~/src/ITKAnisotropicDiffusionLBRWeb:/usr/src/ITKAnisotropicDiffusionLBRWeb \
    -v ~/bin/ITK-build:/usr/src/ITK-build \
    -v ~/bin/ITKAnisotropicDiffusionLBRWeb-build:/usr/src/ITKAnisotropicDiffusionLBRWeb-build \
      thewtex/cross-compiler-browser-asmjs

Start the cross-compilation build of ITK within the Docker container::

  cd /usr/src/ITK-build
  flags='-Wno-warn-absolute-paths --memory-init-file 0 -s DISABLE_EXCEPTION_CATCHING=0 -s ALLOW_MEMORY_GROWTH=1'
  cmake -DCMAKE_TOOLCHAIN_FILE=${CMAKE_TOOLCHAIN_FILE} \
    -G Ninja \
    "-DCMAKE_CXX_FLAGS=$flags" \
    "-DCMAKE_C_FLAGS=$flags" \
    -DBUILD_EXAMPLES=OFF \
    -DBUILD_TESTING=ON \
    -DModule_AnisotropicDiffusionLBR=ON \
      /usr/src/ITK
  ninja
  cd ../ITKAnisotropicDiffusionLBRWeb-build
  cmake -DCMAKE_TOOLCHAIN_FILE=${CMAKE_TOOLCHAIN_FILE} \
    -G Ninja \
    -DCMAKE_BUILD_TYPE=Release \
    "-DCMAKE_CXX_FLAGS=$flags" \
    -DITK_DIR=/usr/src/ITK-build \
    /usr/src/ITKAnisotropicDiffusionLBRWeb
  ninja
  ctest
