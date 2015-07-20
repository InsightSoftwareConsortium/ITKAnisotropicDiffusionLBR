// Emscripten namespace
var Module = Module || {};

// Our namespace
var Runner = Runner || {};


/** Convert binary PNG image data to a PNG that can be displayed on the page.
 * */
Runner.binaryToPng = function(binary_data) {
  try {
    var blob = new Blob([binary_data], {"type": "image\/png"});
    window.URL = window.URL || window.webkitURL;
    return window.URL.createObjectURL(blob);
  } catch (err) { // in case blob / URL missing, fallback to data-uri
    var rawString = '';
    for(var i = 0; i < output_data.length; ++i) {
      rawString += String.fromCharCode(output_data[i]);
    }
    return 'data:image\/png;base64,' + btoa(rawString);
  }
};


Runner.Filter = function () {
  this.parameters = { input_filename: 'PacMan.png',
    output_filename: 'PacManFiltered.png',
    diffusion_time: 20.0,
    lambda: 0.05,
    diffusion_type: 'cEED',
    noise_scale: 3.0,
    feature_scale: 2.0 };

  // Where to put the raw input and output images.
  FS.mkdir('/raw');

  // Where to put the images for display on the webpage
  FS.mkdir('/display');
};


Runner.Filter.prototype.execute = function () {
  progress_element = jQuery('#execution-progress');
  progress_element.css('width', '0%');
  progress_element.attr('aria-valuenow', '0');
  progress_element.html('Starting...');

  var input_filename = this.parameters.input_filename;
  var basename = input_filename.substr(0, input_filename.lastIndexOf('.'));
  var extension = input_filename.substr(input_filename.lastIndexOf('.'));
  this.parameters.output_filename = basename + 'Filtered' + extension;
  $('#output-filename').html(this.parameters.output_filename);

  var output_filename = '/raw/' + this.parameters.output_filename;

  var args = ['/raw/' + this.parameters.input_filename, output_filename,
    this.parameters.diffusion_time.toString(),
    this.parameters.lambda.toString(),
    this.parameters.diffusion_type,
    this.parameters.noise_scale.toString(),
    this.parameters.feature_scale.toString()];
  Module.callMain(args);

  var output_display_filename = '/display/Output.png';
  Module.ccall('ConvertAndResample', 'number',
    ['string', 'string'],
    [output_filename, output_display_filename]);
  var output_data = FS.readFile(output_display_filename, { encoding: 'binary' });
  var output_img = document.getElementById("output-image");
  output_img.src = Runner.binaryToPng(output_data);
  output_img.style.visibility = 'visible';

  progress_element.css('width', '100%');
  progress_element.attr('aria-valuenow', '100');
  progress_element.html('Done.');
};


Runner.Filter.prototype.setInputFile = function (file_name) {
  this.parameters.input_filename = file_name;
  $('#input-filename').html(file_name);
  console.log('Downloading ' + file_name);
  xhr = new XMLHttpRequest();
  xhr.open('GET', 'images/' + file_name);
  xhr.responseType = 'arraybuffer';
  xhr.overrideMimeType('application/octet-stream');
  var that = this;
  xhr.onload = function() {
    console.log('Installing ' + file_name);
    data = new Uint8Array(xhr.response);
    var input_filename = '/raw/' + file_name;
    var input_display_filename = '/display/Input.png';
    FS.writeFile(input_filename, data, { encoding: 'binary' });
    Module.ccall('ConvertAndResample', 'number',
      ['string', 'string'],
      [input_filename, input_display_filename]);
    var input_data = FS.readFile(input_display_filename, { encoding: 'binary' });
    var input_img = document.getElementById("input-image");
    input_img.src = Runner.binaryToPng(input_data);
    input_img.style.visibility = 'visible';
    Runner.filter.execute();
  };
  xhr.send();
};


Runner.Filter.prototype.setUpFilterControls = function () {
  $('#diffusion-time-slider').slider({
    value: (Runner.filter.parameters.diffusion_time != undefined) ? Runner.filter.parameters.diffusion_time : 20 ,
    scale: 'logarithmic',
    precision: 2
  })
  .on('slide', function(ee) {
    Runner.filter.parameters.diffusion_time = ee.value;
  });

  $('#lambda-slider').slider({
    scale: 'logarithmic',
    precision: 4,
    reversed: true
  })
  .on('slide', function(ee) {
    Runner.filter.parameters.lambda = ee.value;
  });

  $('#diffusion-type').change(function(ee) {
    Runner.filter.parameters.diffusion_type = ee.target.value;
  });

  $('#noise-scale-slider').slider({
    precision: 1
  })
  .on('slide', function(ee) {
    Runner.filter.parameters.noise_scale = ee.value;
  });

  $('#feature-scale-slider').slider({
    precision: 1
  })
  .on('slide', function(ee) {
    Runner.filter.parameters.feature_scale = ee.value;
  });

  $('#execute-button').on('click', function() {
    Runner.filter.execute();
  });
  $(document).keypress(function(press) {
    if(press.which === 13) {
      Runner.filter.execute();
    }
  });
};


Runner.Filter.prototype.setFigure = function(figure, subfigure) {
  switch(figure) {
  // PacMan
  case 2:
    switch(subfigure) {
    // cEED
    case 2:
      $('#diffusion-time-slider').slider('setValue', 20.0);
      Runner.filter.parameters.diffusion_time = 20.0;
      $('#lambda-slider').slider('setValue', 0.05);
      Runner.filter.parameters.lambda = 0.05;
      $('#diffusion-type').val('cEED');
      Runner.filter.parameters.diffusion_type = 'cEED';
      $('#noise-scale').slider('setValue', 3.0);
      Runner.filter.parameters.noise_scale = 3.0;
      $('#feature-scale').slider('setValue', 2.0);
      Runner.filter.parameters.feature_scale = 2.0;
      break;
    // cCED
    case 3:
      $('#diffusion-time-slider').slider('setValue', 20.0);
      Runner.filter.parameters.diffusion_time = 20.0;
      $('#lambda-slider').slider('setValue', 0.05);
      Runner.filter.parameters.lambda = 0.05;
      $('#diffusion-type').val('cCED');
      Runner.filter.parameters.diffusion_type = 'cCED';
      $('#noise-scale').slider('setValue', 3.0);
      Runner.filter.parameters.noise_scale = 3.0;
      $('#feature-scale').slider('setValue', 2.0);
      Runner.filter.parameters.feature_scale = 2.0;
      break;
    // Isotropic
    case 4:
      $('#diffusion-time-slider').slider('setValue', 20.0);
      Runner.filter.parameters.diffusion_time = 20.0;
      $('#lambda-slider').slider('setValue', 0.05);
      Runner.filter.parameters.lambda = 0.05;
      $('#diffusion-type').val('Isotropic');
      Runner.filter.parameters.diffusion_type = 'Isotropic';
      $('#noise-scale').slider('setValue', 3.0);
      Runner.filter.parameters.noise_scale = 3.0;
      $('#feature-scale').slider('setValue', 2.0);
      Runner.filter.parameters.feature_scale = 2.0;
      break;
    default:
      console.error('Unknown subfigure: ' + figure);
    }
    Runner.filter.setInputFile('PacMan.png');
    break;
  // FingerPrint
  case 3:
    switch(subfigure) {
    // cEED
    case 2:
      $('#diffusion-time-slider').slider('setValue', 20.0);
      Runner.filter.parameters.diffusion_time = 20.0;
      $('#lambda-slider').slider('setValue', 0.02);
      Runner.filter.parameters.lambda = 0.02;
      $('#diffusion-type').val('cEED');
      Runner.filter.parameters.diffusion_type = 'cEED';
      $('#noise-scale').slider('setValue', 1.0);
      Runner.filter.parameters.noise_scale = 1.0;
      $('#feature-scale').slider('setValue', 2.0);
      Runner.filter.parameters.feature_scale = 2.0;
      break;
    default:
      console.error('Unknown subfigure: ' + figure);
    }
    Runner.filter.setInputFile('FingerPrint.png');
    break;
  default:
    console.error('Unknown figure: ' + figure);
  }
};


Runner.initialize = function () {
  Runner.filter = new Runner.Filter();
  Runner.filter.setUpFilterControls();
  Runner.filter.setInputFile('PacMan.png');
};



$( window ).load( Runner.initialize );
