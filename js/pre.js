var ENVIRONMENT_IS_WEB = typeof window === 'object';

var Module = Module || {};

if (ENVIRONMENT_IS_WEB) {
  Module['noInitialRun'] = true;
  Module['noExitRuntime'] = true;
}
