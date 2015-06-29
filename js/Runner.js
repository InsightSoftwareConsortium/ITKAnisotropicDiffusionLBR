// Emscripten namespace
var Module = Module || {};


var Filter = function () {
  this.parameters = { input_filename: 'PacMan.png',
    diffusion_time: 20.0,
    lambda: 0.05,
    diffusion_type: 'cEED',
    noise_scale: 3.0,
    feature_scale: 2.0 };
};

var filter = new Filter();



Filter.prototype.execute = function () {
  progress_element = jQuery('#execution-progress');
  progress_element.css('width', '0%');
  progress_element.attr('aria-valuenow', '0');
  progress_element.html('Starting...');
  var args = ['/Input.png', '/Filtered.png',
    filter.parameters.diffusion_time.toString(),
    filter.parameters.lambda.toString(),
    filter.parameters.diffusion_type,
    filter.parameters.noise_scale.toString(),
    filter.parameters.feature_scale.toString()];
  Module.callMain(args);
  var output_data = FS.readFile('/Filtered.png', { encoding: 'binary' });
  var output_img = document.getElementById("output-image");
  try {
    var blob = new Blob([output_data], {"type": "image\/png"});
    window.URL = window.URL || window.webkitURL;
    output_img.src = window.URL.createObjectURL(blob);
  } catch (err) { // in case blob / URL missing, fallback to data-uri
    console.log(err);
    var rawString = '';
    for(var i = 0; i < output_data.length; ++i) {
      rawString += String.fromCharCode(output_data[i]);
    }
    output_img.src = 'data:image\/png;base64,' + btoa(rawString);
  }
  output_img.style.visibility = 'visible';
};


Filter.prototype.setInputFile = function (file_name) {
  this.parameters.input_filename = file_name;
  console.log('Downloading ' + file_name);
  xhr = new XMLHttpRequest();
  xhr.open('GET', file_name);
  xhr.responseType = 'arraybuffer';
  xhr.overrideMimeType('application/octet-stream');
  xhr.onload = function() {
    console.log('Installing ' + file_name);
    data = new Uint8Array(xhr.response);
    FS.writeFile('/Input.png', data, { encoding: 'binary' });
    Filter.prototype.execute.call(filter);
  };
  xhr.send();
};


Filter.prototype.setDiffusionTime = function(diffusion_time) {
  var value = diffusion_time;
  if(typeof diffusion_time === 'object') {
    value = diffusion_time.value;
  }
  filter.parameters.diffusion_time = value;
}


var setUpFilterControls = function () {
  var slider = $('#diffusion-time-slider').slider({
    min: 0.05,
    max: 50,
    scale: 'logarithmic',
    step: 0.05,
    precision: 2
  })
  .on('slide', filter.setDiffusionTime);
}


var initialize = function () {
  setUpFilterControls();
  filter.setInputFile('PacMan.png');
  $('#execute-button').on('click', filter.execute);
};

$( window ).load( initialize );
