add_subdirectory("../src/Headers" "${CMAKE_CURRENT_BINARY_DIR}/src/Headers")

include_directories(${PROJECT_DIR} ${CMAKE_CURRENT_SOURCE_DIR})

itk_module_test()

Set(ITK${itk-module}Tests
  CoherenceEnhancingDiffusionTest.cxx
  LinearAnisotropicDiffusionTest.cxx
)  

set(ITK_TEST_DRIVER itkTestDriver)

CreateTestDriver(${itk-module}  "${${itk-module}-Test_LIBRARIES}" "${ITK${itk-module}Tests}")

itk_add_test(NAME Triangle_cEED_Test
  COMMAND ${itk-module}TestDriver
  --compare ${${itk-module}_SOURCE_DIR}/test/Baseline/Triangle_E.png
            ${ITK_TEST_OUTPUT_DIR}/Triangle_E_Test.png
  CoherenceEnhancingDiffusionTest ${${itk-module}_SOURCE_DIR}/test/Input/Triangle.png
            ${ITK_TEST_OUTPUT_DIR}/Triangle_E_Test.png 5 0.03 Edge
            )

itk_add_test(NAME Triangle_EED_Test
  COMMAND ${itk-module}TestDriver
  --compare ${${itk-module}_SOURCE_DIR}/test/Baseline/Triangle_EF.png
            ${ITK_TEST_OUTPUT_DIR}/Triangle_EF_Test.png
  CoherenceEnhancingDiffusionTest ${${itk-module}_SOURCE_DIR}/test/Input/Triangle.png
            ${ITK_TEST_OUTPUT_DIR}/Triangle_EF_Test.png 5 0.03 EdgeForced
)

itk_add_test(NAME LAD_Test
  COMMAND ${itk-module}TestDriver
  --compare ${${itk-module}_SOURCE_DIR}/test/Baseline/VectorField_CircleOpposites_E.hdf5
            ${ITK_TEST_OUTPUT_DIR}/VectorField_CircleOpposites_E_Test.hdf5

  LinearAnisotropicDiffusionTest 
  	${${itk-module}_SOURCE_DIR}/test/Input/VectorField_CircleOpposites.hdf5
  	${${itk-module}_SOURCE_DIR}/test/Input/TensorField_Circle_Anisotropic.hdf5
  	10
  	${ITK_TEST_OUTPUT_DIR}/VectorField_CircleOpposites_E_Test.hdf5
)

