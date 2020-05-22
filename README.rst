ITKAnisotropicDiffusionLBR
==========================

.. image:: https://github.com/InsightSoftwareConsortium/ITKAnisotropicDiffusionLBR/workflows/Build,%20test,%20package/badge.svg

.. image:: https://img.shields.io/pypi/v/itk-anisotropicdiffusionlbr.svg
    :target: https://pypi.python.org/pypi/itk-anisotropicdiffusionlbr
    :alt: PyPI

.. image:: https://img.shields.io/badge/License-Apache%202.0-blue.svg
    :target: https://github.com/InsightSoftwareConsortium/ITKAnisotropicDiffusionLBR/blob/master/LICENSE)
    :alt: License

This `ITK <http://itk.org>`_ module implements Anisotropic Diffusion, using Lattice Basis Reduction.

Documentation can be found in the `Insight Journal article <http://insight-journal.org/browse/publication/953>`_::

  Mirebeau J., Fehrenbach J., Risser L., Tobji S.
  "Anisotropic Diffusion in ITK",
  The Insight Journal,
  January-December, 2014.
  http://insight-journal.org/browse/publication/953
  http://hdl.handle.net/10380/3505

To install the Python packages::

  python -m pip install --upgrade pip
  python -m pip install itk-anisotropicdiffusionlbr

Figures from this article can be `reproduced in your web browser
<http://insightsoftwareconsortium.github.io/ITKAnisotropicDiffusionLBR/>`_.
Sources for the interactive figures can be found in the `gh-pages branch
<https://github.com/InsightSoftwareConsortium/ITKAnisotropicDiffusionLBR/tree/gh-pages>`_
of this repository.

Since ITK 4.9.0, this module is available in the ITK source tree as a Remote
module.  To enable it, set::

  Module_AnisotropicDiffusionLBR:BOOL=ON

in ITK's CMake build configuration.
