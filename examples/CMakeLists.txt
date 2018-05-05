cmake_minimum_required(VERSION 3.10.2)

project(AnisotropicDiffusionLBR_Examples)

find_package(ITK REQUIRED
  COMPONENTS
    AnisotropicDiffusionLBR
    ITKIOPNG
    )
include(${ITK_USE_FILE})


add_executable(CoherenceEnhancingDiffusion
  CoherenceEnhancingDiffusion.cxx)
target_link_libraries(CoherenceEnhancingDiffusion
  ${ITK_LIBRARIES})


enable_testing()
find_path(INPUT_DATA_DIR
  NAMES PacMan.png
  HINTS ${ITK_DIR}/ExternalData/Modules/Remote/AnisotropicDiffusionLBR/test/Input
        ${ITK_DIR}/ExternalData/Modules/External/AnisotropicDiffusionLBR/test/Input
  )
set(TEST_OUTPUT_DIR ${AnisotropicDiffusionLBR_Examples_BINARY_DIR}/Testing/Temporary)


if(INPUT_DATA_DIR)
  add_test(NAME CoherenceEnhancingDiffusionTest
    COMMAND CoherenceEnhancingDiffusion ${INPUT_DATA_DIR}/PacMan.png
      ${TEST_OUTPUT_DIR}/PacManFiltered.png
      20 0.05 cCED 3)
endif()
