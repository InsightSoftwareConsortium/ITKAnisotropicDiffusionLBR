ITKAnisotropicDiffusionLBR
==========================

.. image:: https://circleci.com/gh/InsightSoftwareConsortium/ITKAnisotropicDiffusionLBR.svg?style=svg
    :target: https://circleci.com/gh/InsightSoftwareConsortium/ITKAnisotropicDiffusionLBR

This `ITK <http://itk.org>`_ module implements Anisotropic Diffusion, using Lattice Basis Reduction.

Documentation can be found in the Insight Journal article::

  Mirebeau J., Fehrenbach J., Risser L., Tobji S.
  "Anisotropic Diffusion in ITK",
  The Insight Journal,
  January-December, 2014.
  http://insight-journal.org/browse/publication/953
  http://hdl.handle.net/10380/3505

Figures from this article can be `reproduced in your web browser
<http://insightsoftwareconsortium.github.io/ITKAnisotropicDiffusionLBR/>`_.
Sources for the interactive figures can be found in the `gh-pages branch
<https://github.com/InsightSoftwareConsortium/ITKAnisotropicDiffusionLBR/tree/gh-pages>`_
of this repository.

Since ITK 4.9.0, this module is available in the ITK source tree as a Remote
module.  To enable it, set::

  Module_AnisotropicDiffusionLBR:BOOL=ON

in ITK's CMake build configuration.
