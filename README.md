# ITKAnisotropicDiffusionLBR — Archived

This module has been ingested into the main ITK repository and is no longer
maintained as a remote module.

The code now lives in ITK proper at:

    Modules/Filtering/AnisotropicDiffusionLBR/

- Upstream ITK: https://github.com/InsightSoftwareConsortium/ITK
- Ingestion PR: https://github.com/InsightSoftwareConsortium/ITK/pull/6093
  (merged 2026-04-23, commit `ceedf987bd`)

## What changed

Anisotropic diffusion LBR filters are now built and released as part of
ITK itself. Users no longer need to add this repository as an external
remote module.

To use the filters, build ITK with module
`Module_AnisotropicDiffusionLBR=ON` and link against `ITKAnisotropicDiffusionLBR`.

## History

The full history of this repository — including the original Insight Journal
contribution and all subsequent fixes — is preserved in this repository's
git log. New development happens in the ITK monorepo.

This repository has been placed in archive (read-only) mode.
