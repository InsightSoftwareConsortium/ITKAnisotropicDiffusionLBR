#include "itkImageFileReader.h"
#include "itkImageFileWriter.h"
#include "itkResampleImageFilter.h"
#include "itkRescaleIntensityImageFilter.h"
#include "itkNearestNeighborInterpolateImageFunction.h"

// todo, use neighborhood interpolator

extern "C"
{


/** Convert the input image to a PNG and resample it for display. */
int ConvertAndResample( char * inputFileName, char * outputFileName )
{
  std::cout << "Convert and resampling..." << std::endl;

  const unsigned int InputDimension = 2;
  const unsigned int OutputDimension = 2;

  const itk::SizeValueType width = 320;

  typedef unsigned char InputPixelType;
  typedef unsigned char OutputPixelType;

  typedef itk::Image< InputPixelType, InputDimension >   InputImageType;
  typedef itk::Image< OutputPixelType, OutputDimension > OutputImageType;

  typedef itk::ImageFileReader< InputImageType > ReaderType;
  ReaderType::Pointer reader = ReaderType::New();
  reader->SetFileName( inputFileName );

  try
    {
    reader->UpdateOutputInformation();
    }
  catch( itk::ExceptionObject & error )
    {
    std::cerr << "Error: " << error << std::endl;
    return EXIT_FAILURE;
    }
  InputImageType::ConstPointer inputImage = reader->GetOutput();

  typedef itk::ResampleImageFilter< InputImageType, InputImageType > ResamplerType;
  ResamplerType::Pointer resampler = ResamplerType::New();
  resampler->SetInput( reader->GetOutput() );

  const InputImageType::SizeType inputSize = inputImage->GetLargestPossibleRegion().GetSize();
  const InputImageType::SpacingType inputSpacing = inputImage->GetSpacing();

  InputImageType::SpacingType outputSpacing;
  InputImageType::SizeType outputSize;
  outputSize[1] = width;
  outputSpacing[1] = ( inputSpacing[1] * inputSize[0] ) / outputSize[1];
  outputSpacing[0] = outputSpacing[1];
  outputSize[0] = ( inputSpacing[0] * inputSize[0] ) / outputSpacing[0];
  resampler->SetSize( outputSize );
  resampler->SetOutputSpacing( outputSpacing );

  resampler->SetOutputOrigin( inputImage->GetOrigin() );
  resampler->SetOutputDirection( inputImage->GetDirection() );

  typedef itk::NearestNeighborInterpolateImageFunction< InputImageType > InterpolatorType;
  InterpolatorType::Pointer interpolator = InterpolatorType::New();
  resampler->SetInterpolator( interpolator );

  typedef itk::RescaleIntensityImageFilter< InputImageType, OutputImageType > RescalerType;
  RescalerType::Pointer rescaler = RescalerType::New();
  rescaler->SetInput( resampler->GetOutput() );

  typedef itk::ImageFileWriter< OutputImageType > WriterType;
  WriterType::Pointer writer = WriterType::New();
  writer->SetFileName( outputFileName );
  writer->SetInput( rescaler->GetOutput() );

  try
    {
    writer->UpdateLargestPossibleRegion();
    }
  catch( itk::ExceptionObject & error )
    {
    std::cerr << "Error: " << error << std::endl;
    return EXIT_FAILURE;
    }

  return EXIT_SUCCESS;
}

} // end extern "C"
