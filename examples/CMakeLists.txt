cmake_minimum_required(VERSION 3.10.2)

project(AnisotropicDiffusionLBR_Examples)

find_package(ITK REQUIRED
  COMPONENTS
    AnisotropicDiffusionLBR
    ITKIOImageBase
    ITKIOPNG
    )
include(${ITK_USE_FILE})


add_executable(CoherenceEnhancingDiffusion
  CoherenceEnhancingDiffusion.cxx)
target_link_libraries(CoherenceEnhancingDiffusion
  ${ITK_LIBRARIES})


enable_testing()
set(INPUT_DATA_DIR ${AnisotropicDiffusionLBR_SOURCE_DIR}/examples/Data)
set(TEST_OUTPUT_DIR ${AnisotropicDiffusionLBR_BINARY_DIR}/Testing/Temporary)



add_test(NAME CoherenceEnhancingDiffusionTest
  COMMAND CoherenceEnhancingDiffusion ${INPUT_DATA_DIR}/PacMan.png
    ${TEST_OUTPUT_DIR}/PacManFiltered.png
    20 0.05 cCED 3)
