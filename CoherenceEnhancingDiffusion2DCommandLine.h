/*=========================================================================
 *
 *  Copyright Insight Software Consortium
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0.txt
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 *=========================================================================*/
//
//
//  Created by Jean-Marie Mirebeau on 20/11/2014.
//
//

#ifndef itkDiffusion_CoherenceEnhancingDiffusion2DCommandLine_h
#define itkDiffusion_CoherenceEnhancingDiffusion2DCommandLine_h

#include "itkImageFileReader.h"
#include "itkImageFileWriter.h"
#include "itkCoherenceEnhancingDiffusionFilter.h"
#include "LinearAnisotropicDiffusionCommandLine.h"
#include "itkTimeProbe.h"
#include "itkPNGImageIOFactory.h"
#include "itkCommand.h"

#include "emscripten.h"

namespace CoherenceEnhancingDiffusion2DCommandLine
{

void Usage()
  {
    std::cerr <<
    "Input image filename -     2D and 3D images supported. Required.\n" <<
    "Output image filename -    Required.\n" <<
    "Diffusion time -           Suggested range: 0.5-5, up to 50 for strong noise. Default: 2.\n" <<
    "Lambda -                   Small values detect more edges. Suggested range: 0.05, 0.0001. Default: 0.01\n" <<
    "Weickert diffusion type -  Accepted values: Edge, Coherence. Default: Edge.\n" <<
    "Noise scale -              Suggested range: 0.5 - 4. Default 1.\n" <<
    "Feature scale -            Suggested range: 2-6. Default 2.\n"
    << "\n";
  }

using namespace itk;

int Execute(int argc, char * argv[]);

template<int VDimension>
int Execute(int argc, char * argv[], itk::ImageIOBase::IOComponentType, int nComponents);

template<int VDimension, typename ScalarType, typename ComponentType>
int Execute(int argc, char * argv[], int nComponents);

template<int VDimension, typename ScalarType, typename PixelType, typename ExportPixelType>
int Execute(int argc, char * argv[]);


typedef LinearAnisotropicDiffusionCommandLine::ReportProgressToCOutType ReportProgressToCOutType;

class EmscriptenProgressUpdate: public itk::Command
{
public:
  itkNewMacro(EmscriptenProgressUpdate);

  void Execute(itk::Object *caller, const itk::EventObject & event)
  {
    Execute( (const itk::Object *)caller, event);
  }

  void Execute(const itk::Object * object, const itk::EventObject &)
  {
    const int progress = static_cast< int >(100*dynamic_cast<const itk::ProcessObject*>(object)->GetProgress());
    EM_ASM_ARGS({
      if(typeof FilterWorker !== 'undefined') {
        self.postMessage({'cmd': 'set_progress', 'progress': $0});
      }
      }, progress);
  }
};


int Execute(int argc, char * argv[])
{
  using std::cerr;
  using std::endl;
  using namespace itk;

  if(argc < 2 + 1 )
    {
    Usage();
    return EXIT_SUCCESS;
    }

  const char * imageFileName = argv[1];

  itk::ObjectFactoryBase::RegisterFactory( itk::PNGImageIOFactory::New() );

  itk::ImageIOBase::Pointer imageIO = itk::ImageIOFactory::CreateImageIO( imageFileName, itk::ImageIOFactory::ReadMode );
  if( imageIO.IsNull() )
    {
    std::cerr << "Could not create ImageIO" << std::endl;
    return EXIT_FAILURE;
    }
  imageIO->SetFileName( imageFileName );
  imageIO->ReadImageInformation();

  const unsigned int imageDimension = imageIO->GetNumberOfDimensions();
  const itk::ImageIOBase::IOComponentType componentType = imageIO->GetComponentType();
  const unsigned int nComponents = imageIO->GetNumberOfComponents();

  switch( imageDimension )
    {
    case 2:
      return Execute<2>(argc,argv,componentType,nComponents);
    //case 3:
      //return Execute<3>(argc,argv,componentType,nComponents);
    default:
      itkGenericExceptionMacro("Sorry, unsupported image dimension.");
    }
}

template<int Dimension>
int Execute(int argc, char * argv[], itk::ImageIOBase::IOComponentType componentType, int nComponents)
{
  switch(componentType)
    {
    case itk::ImageIOBase::UCHAR:
      return Execute<Dimension, float, unsigned char>(argc,argv,nComponents);
    //case itk::ImageIOBase::FLOAT:
      //return Execute<Dimension, float, float>(argc,argv,nComponents);
    //case itk::ImageIOBase::DOUBLE:
      //return Execute<Dimension, double, double>(argc,argv,nComponents);
    default:
      itkGenericExceptionMacro("Sorry, unsupported component type");
    }
}

template<int Dimension, typename ScalarType, typename ComponentType>
int Execute(int argc, char * argv[], int nComponents)
{
  switch(nComponents)
    {
    case 1:
      return Execute<Dimension,ScalarType,ScalarType,ComponentType>(argc,argv);
    //case 2:
      //return Execute<Dimension,ScalarType,Vector<ScalarType,2>,Vector<ComponentType,2> >(argc,argv);
    case 3:
      return Execute<Dimension,ScalarType,Vector<ScalarType,3>,Vector<ComponentType,3> >(argc,argv);
    case 4:
      return Execute<Dimension,ScalarType,Vector<ScalarType,4>,Vector<ComponentType,4> >(argc,argv);
    default:
      itkGenericExceptionMacro("Sorry, unsupported number of components");
    }
}

template<int Dimension, typename ScalarType, typename PixelType, typename ExportPixelType>
int Execute(int argc, char * argv[])
{
  typedef Image<PixelType,Dimension> ImageType;

  typedef ImageFileReader<ImageType> ReaderType;
  typename ReaderType::Pointer reader = ReaderType::New();

  const char * imageFileName = argv[1];
  const char * outputFileName = argv[2];

  reader->SetFileName(imageFileName);

  typedef CoherenceEnhancingDiffusionFilter<ImageType,ScalarType> DiffusionFilterType;
  typename DiffusionFilterType::Pointer diffusionFilter = DiffusionFilterType::New();
  diffusionFilter->SetInput(reader->GetOutput());

  ReportProgressToCOutType::Pointer reportDiffusionProgress = ReportProgressToCOutType::New();
  diffusionFilter->AddObserver(ProgressEvent(), reportDiffusionProgress);

  EmscriptenProgressUpdate::Pointer emscriptenProgress = EmscriptenProgressUpdate::New();
  diffusionFilter->AddObserver(ProgressEvent(), emscriptenProgress);

  int argIndex = 3;
  if( argIndex < argc )
    {
    const double diffusionTime = atof(argv[argIndex++]);
    if(diffusionTime==0) itkGenericExceptionMacro("Error: Unrecognized diffusion time (third argument).\n");
    diffusionFilter->SetDiffusionTime(diffusionTime);
    }

  if( argIndex < argc )
    {
    const double lambda = atof(argv[argIndex++]);
    if(lambda==0.) itkGenericExceptionMacro("Error: Unrecognized lambda (fourth argument).\n");
    diffusionFilter->SetLambda(lambda);
    }

  if( argIndex < argc )
    {
    const char * enhancement = argv[argIndex++];
    if(!strcmp(enhancement,"EED"))
        diffusionFilter->SetEnhancement(DiffusionFilterType::EED); // Weickert's exponent : 4.
    else if(!strcmp(enhancement,"cEED"))
        diffusionFilter->SetEnhancement(DiffusionFilterType::cEED); // Weickert's exponent : 4.
    else if(!strcmp(enhancement,"CED"))
        diffusionFilter->SetEnhancement(DiffusionFilterType::CED); // Weickert's exponent : 2.
    else if(!strcmp(enhancement, "cCED"))
        diffusionFilter->SetEnhancement(DiffusionFilterType::cCED); // Weickert's exponent : 2.
    else if(!strcmp(enhancement, "Isotropic"))
        diffusionFilter->SetEnhancement(DiffusionFilterType::Isotropic); //Perona-Mali's exponent: 2.
    else
        itkGenericExceptionMacro("Error: Unrecognized enhancement (fifth argument).\n");
    }

  if( argIndex < argc )
    {
    const double noiseScale = atof(argv[argIndex++]);
    if(noiseScale==0.) itkGenericExceptionMacro("Error: Unrecognized noiseScale (sixth argument).\n");
    diffusionFilter->SetNoiseScale(noiseScale);
    }

  if( argIndex < argc )
    {
    const double featureScale = atof(argv[argIndex++]);
    if(featureScale==0.) itkGenericExceptionMacro("Error: Unrecognized featureScale (seventh argument).\n");
    diffusionFilter->SetFeatureScale(featureScale);
    }

  if( argIndex < argc )
    {
    const double exponent = atof(argv[argIndex++]);
    if(exponent==0.) itkGenericExceptionMacro("Error: Unrecognized exponent (eighth argument).\n");
    diffusionFilter->SetExponent(exponent);
    }

  if( argIndex < argc )
    {
    itkGenericExceptionMacro("Error: excessive number of arguments");
    }


  typedef Image<ExportPixelType,Dimension> ExportImageType;
  typedef CastImageFilter<ImageType, ExportImageType> CasterType;
  typename CasterType::Pointer caster = CasterType::New();
  caster->SetInput(diffusionFilter->GetOutput());

  //typedef typename DiffusionFilterType::ScalarImageType ScalarImageType;
  typedef ImageFileWriter<ExportImageType> WriterType;
  typename WriterType::Pointer writer = WriterType::New();
  writer->SetInput(caster->GetOutput());
  writer->SetFileName(outputFileName);

  itk::TimeProbe clock;
  clock.Start();
  writer->Update();
  clock.Stop();
  std::cout << "Filtering took: " << clock.GetMean() << " seconds\n";

  return EXIT_SUCCESS;
}

} // end namespace CoherenceEnhancingDiffusion2DCommandLine

#endif
