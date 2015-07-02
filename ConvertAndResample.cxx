#include "itkImageFileReader.h"
#include "itkImageFileWriter.h"

extern "C"
{


/** Convert the input image to a PNG and resample it for display. */
int ConvertAndResample( char * inputFileName, char * outputFileName )
{
  std::cout << "Convert and resampling..." << std::endl;

  const unsigned int InputDimension = 2;
  const unsigned int OutputDimension = 2;

  typedef unsigned char InputPixelType;
  typedef unsigned char OutputPixelType;

  typedef itk::Image< InputPixelType, InputDimension >   InputImageType;
  typedef itk::Image< OutputPixelType, OutputDimension > OutputImageType;

  typedef itk::ImageFileReader< InputImageType > ReaderType;
  ReaderType::Pointer reader = ReaderType::New();
  reader->SetFileName( inputFileName );

  typedef itk::ImageFileWriter< OutputImageType > WriterType;
  WriterType::Pointer writer = WriterType::New();
  writer->SetFileName( outputFileName );
  writer->SetInput( reader->GetOutput() );

  try
    {
    writer->Update();
    }
  catch( itk::ExceptionObject & error )
    {
    std::cerr << "Error: " << error << std::endl;
    return EXIT_FAILURE;
    }

  return EXIT_SUCCESS;
}

} // end extern "C"
