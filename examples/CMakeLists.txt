cmake_minimum_required(VERSION 2.8)

project(AnisotropicDiffusionLBR_Examples)

find_package(ITK REQUIRED)
include(${ITK_USE_FILE})

add_executable(CoherenceEnhancingDiffusion
  CoherenceEnhancingDiffusion.cxx)
target_link_libraries(CoherenceEnhancingDiffusion
  ${ITK_LIBRARIES})
