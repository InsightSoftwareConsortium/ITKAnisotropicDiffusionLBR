var Filter = function () {
  this.parameters = { input_filename: 'PacMan.png',
    diffusion_time: 20.0,
    lambda: 0.05,
    diffusion_type: 'cEED',
    noise_scale: 1.0,
    feature_scale: 2.0 };
};


Filter.prototype.execute = function () {
  var args = ['/Input.png', '/Filtered.png',
    this.parameters.diffusion_time.toString(),
    this.parameters.lambda.toString(),
    this.parameters.diffusion_type,
    this.parameters.noise_scale.toString(),
    this.parameters.feature_scale.toString()];
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


Filter.prototype.setInputFile = function (file_name, callback) {
  this.parameters.input_filename = file_name;
  console.log('Downloading ' + file_name);
  xhr = new XMLHttpRequest();
  xhr.open('GET', file_name);
  xhr.responseType = 'arraybuffer';
  xhr.overrideMimeType('application/octet-stream');
  var filter = this;
  xhr.onload = function() {
    console.log('Installing ' + file_name);
    data = new Uint8Array(xhr.response);
    FS.writeFile('/Input.png', data, { encoding: 'binary' });
    Filter.prototype.execute.call(filter);
  };
  xhr.send();
};


var filter = new Filter();

var filterPacMan = function () {
  filter.setInputFile('PacMan.png');
};

$( window ).load( filterPacMan );
