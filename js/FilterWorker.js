var FilterWorker = FilterWorker || {};

importScripts('EmscriptenDebug.js', '../CoherenceEnhancingDiffusion.js');

// Where to put the raw input and output images.
FS.mkdir('/raw');

self.addEventListener('message', function(e) {
  switch(e.data.cmd) {
  case 'install_input':
    FS.writeFile(e.data.input_filepath, e.data.data, { encoding: 'binary' });
    self.postMessage({'cmd': 'execute'});
    break;
  case 'run_filter':
    var parameters = e.data.parameters;
    var output_filename = '/raw/' + parameters.output_filename;
    var args = ['/raw/' + parameters.input_filename,
      output_filename,
      parameters.diffusion_time.toString(),
      parameters.lambda.toString(),
      parameters.diffusion_type,
      parameters.noise_scale.toString(),
      parameters.feature_scale.toString(),
      parameters.exponent.toString()];
    Module.callMain(args);

    var output_data = FS.readFile(output_filename, { encoding: 'binary' });
    self.postMessage({'output_data': output_data}, [output_data.buffer]);
    break;
  default:
    console.error('Unknown worker command.');
  }
}, false);
