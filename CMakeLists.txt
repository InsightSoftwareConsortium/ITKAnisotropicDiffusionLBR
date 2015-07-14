cmake_minimum_required(VERSION 2.8)

project(AnisotropicDiffusionLBR_Examples)

find_package(ITK REQUIRED
  COMPONENTS
    AnisotropicDiffusionLBR
    ITKIOPNG
    ITKImageIntensity
  )
include(${ITK_USE_FILE})

enable_testing()

set(INPUT_DATA_DIR ${ITK_DIR}/ExternalData/Modules/External/ITKAnisotropicDiffusionLBR/test/Input)
if(NOT EXISTS ${INPUT_DATA_DIR}/PacMan.png)
  message(SEND_ERROR "INPUT_DATA_DIR not found!")
endif()
set(TEST_OUTPUT_DIR /)
file(MAKE_DIRECTORY ${AnisotropicDiffusionLBR_Examples_BINARY_DIR}/Input)
file(COPY ${INPUT_DATA_DIR}/PacMan.png
  DESTINATION ${AnisotropicDiffusionLBR_Examples_BINARY_DIR}/Input)


add_executable(CoherenceEnhancingDiffusion
  CoherenceEnhancingDiffusion.cxx
  ConvertAndResample.cxx)
set_target_properties(CoherenceEnhancingDiffusion PROPERTIES LINK_FLAGS
  "--embed-file Input -s EXPORTED_FUNCTIONS=\"['_main', '_ConvertAndResample']\"")
target_link_libraries(CoherenceEnhancingDiffusion
  ${ITK_LIBRARIES})
em_link_pre_js(CoherenceEnhancingDiffusion ${CMAKE_CURRENT_SOURCE_DIR}/js/pre.js)



add_test(NAME CoherenceEnhancingDiffusionTest
  COMMAND CoherenceEnhancingDiffusion /Input/PacMan.png
    ${TEST_OUTPUT_DIR}/PacManFiltered.png
    20 0.05 cCED 3)
