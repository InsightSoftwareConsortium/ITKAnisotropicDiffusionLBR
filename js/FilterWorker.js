importScripts('EmscriptenDebug.js', '../CoherenceEnhancingDiffusion.js');

// Where to put the raw input and output images.
FS.mkdir('/raw');

self.addEventListener('message', function(e) {
  switch(e.data.cmd) {
  case 'install_input':
    FS.writeFile(e.data.input_filepath, e.data.data, { encoding: 'binary' });
    self.postMessage({'cmd': 'execute'});
    break;
  default:
    console.error('Unknown worker command.');
  }
}, false);
