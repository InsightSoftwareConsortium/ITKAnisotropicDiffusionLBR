/*=========================================================================
 *
 *  Copyright NumFOCUS
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         https://www.apache.org/licenses/LICENSE-2.0.txt
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 *=========================================================================*/

//
//  Created by Jean-Marie Mirebeau on 07/03/2014.
//
//

#ifndef itkUnaryFunctorWithIndexImageFilter_h
#define itkUnaryFunctorWithIndexImageFilter_h

#include "itkImageRegionConstIteratorWithIndex.h"
#include "itkImageScanlineIterator.h"
#include "itkAnisotropicDiffusionLBRMacro.h"
#include "itkImageToImageFilter.h"

namespace itk
{

/** \class UnaryFunctorWithIndexImageFilter
 *
 * \brief A (simplification of) UnaryFunctorImageFilter, which provides the pixel index to the functor.
 *
 * \ingroup AnisotropicDiffusionLBR
 */
template <typename TInputImage, typename TOutputImage, typename TFunctor>
class UnaryFunctorWithIndexImageFilter : public ImageToImageFilter<TInputImage, TOutputImage>
{
public:
  ITK_DISALLOW_COPY_AND_MOVE(UnaryFunctorWithIndexImageFilter);

  using Self = UnaryFunctorWithIndexImageFilter;
  using Superclass = ImageToImageFilter<TInputImage, TOutputImage>;
  using Pointer = SmartPointer<Self>;
  using ConstPointer = SmartPointer<const Self>;

  /** Method for creation through the object factory. */
  itkNewMacro(Self);

  /** Run-time type information (and related methods). */
  itkOverrideGetNameOfClassMacro(UnaryFunctorWithIndexImageFilter);

  using InputImageType = TInputImage;
  using OutputImageType = TOutputImage;
  using FunctorType = TFunctor;

  GetSetFunctorMacro(Functor, FunctorType);

protected:
  UnaryFunctorWithIndexImageFilter() { this->DynamicMultiThreadingOn(); }

  FunctorType m_Functor;

  using InputRegionType = typename InputImageType::RegionType;
  using OutputRegionType = typename OutputImageType::RegionType;

  void
  DynamicThreadedGenerateData(const OutputRegionType & region) override
  {
    if (region.GetSize()[0] == 0)
    {
      return;
    }

    ImageRegionConstIteratorWithIndex<InputImageType> inputIt(this->GetInput(), region);
    ImageScanlineIterator<OutputImageType>            outputIt(this->GetOutput(), region);

    for (inputIt.GoToBegin(), outputIt.GoToBegin(); !outputIt.IsAtEnd();)
    {
      while (!outputIt.IsAtEndOfLine())
      {
        outputIt.Set(m_Functor(inputIt.Value(), inputIt.GetIndex()));
        ++inputIt;
        ++outputIt;
      }
      outputIt.NextLine();
    }
  }
};

} // end namespace itk

#endif
