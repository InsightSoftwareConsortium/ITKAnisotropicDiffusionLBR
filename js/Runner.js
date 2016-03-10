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
    for(var i = 0; i < binary_data.length; ++i) {
      rawString += String.fromCharCode(binary_data[i]);
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
    feature_scale: 2.0,
    exponent: 2.0 };

  // Where to put the raw input and output images.
  FS.mkdir('/raw');

  // Where to put the images for display on the webpage
  FS.mkdir('/display');

  if(typeof window.Worker === "function") {
    this.worker = new Worker("js/FilterWorker.js");
  } else {
    this.worker = null;
  }
};


Runner.Filter.prototype.setProgress = function(progress) {
  var progress_element = $('#execution-progress');
  var progress_str = progress.toString();
  progress_element.css('width', progress_str + '%');
  progress_element.attr('aria-valuenow', progress_str);
  progress_element.html(progress_str + '%');
};


Runner.Filter.prototype.postExecute = function () {
  var output_display_filename = '/display/Output.png';
  var output_filename = '/raw/' + this.parameters.output_filename;
  Module.ccall('ConvertAndResample', 'number',
    ['string', 'string'],
    [output_filename, output_display_filename]);
  var output_data = FS.readFile(output_display_filename, { encoding: 'binary' });
  var output_img = document.getElementById("output-image");
  output_img.src = Runner.binaryToPng(output_data);
  output_img.style.visibility = 'visible';

  var progress_element = $('#execution-progress');
  this.setProgress(0);
  progress_element.removeClass('progress-bar-striped active');
  progress_element.html('Done.');
};


Runner.Filter.prototype.execute = function () {
  var progress_element = $('#execution-progress');
  this.setProgress(0);
  progress_element.addClass('progress-bar-striped active');
  progress_element.html('Starting...');

  var input_filename = this.parameters.input_filename;
  var basename = input_filename.substr(0, input_filename.lastIndexOf('.'));
  var extension = input_filename.substr(input_filename.lastIndexOf('.'));
  this.parameters.output_filename = basename + 'Filtered' + extension;
  $('#output-filename').html(this.parameters.output_filename);

  var output_filename = '/raw/' + this.parameters.output_filename;

  var args = ['/raw/' + this.parameters.input_filename,
    output_filename,
    this.parameters.diffusion_time.toString(),
    this.parameters.lambda.toString(),
    this.parameters.diffusion_type,
    this.parameters.noise_scale.toString(),
    this.parameters.feature_scale.toString(),
    this.parameters.exponent.toString()];
  if(this.worker) {
    this.worker.postMessage({'cmd': 'run_filter', 'parameters': this.parameters});
  }
  else {
    Module.callMain(args);
    this.postExecute();
  }
};


Runner.Filter.prototype.displayInput = function (filepath) {
  var input_data = FS.readFile(filepath, { encoding: 'binary' });
  var input_img = document.getElementById("input-image");
  input_img.src = Runner.binaryToPng(input_data);
  input_img.style.visibility = 'visible';
};


Runner.Filter.prototype.setInputFile = function (input_file) {
  var input_filename = input_file;
  if(typeof input_file === 'object') {
    input_filename = input_file.name;
  }
  this.parameters.input_filename = input_filename;
  $('#input-filename').html(input_filename);

  var input_filepath = '/raw/' + input_filename;
  var input_display_filepath = '/display/' + input_filename + '.png';
  // Re-use the file it has already been downloaded.
  try {
    FS.stat(input_filepath);
    this.displayInput(input_display_filepath);
    if(this.worker) {
      this.worker.postMessage({'cmd': 'run_filter', 'parameters': this.parameters});
    }
    else {
      Runner.filter.execute();
    }
  }
  catch(err) {
    if(typeof input_file === 'string') {
      console.log('Downloading ' + input_filename);
      xhr = new XMLHttpRequest();
      xhr.open('GET', 'images/' + input_filename);
      xhr.responseType = 'arraybuffer';
      xhr.overrideMimeType('application/octet-stream');
      var that = this;
      xhr.onload = function() {
        console.log('Installing ' + input_filename);
        var data = new Uint8Array(xhr.response);
        FS.writeFile(input_filepath, data, { encoding: 'binary' });
        Module.ccall('ConvertAndResample', 'number',
          ['string', 'string'],
          [input_filepath, input_display_filepath]);
        that.displayInput(input_display_filepath);
        if(that.worker) {
          that.worker.postMessage({'cmd': 'install_input',
            'input_filepath': input_filepath,
            'data': data});
        }
        else {
          Runner.filter.execute();
        }
      };
      xhr.send();
    }
    else { // A File object
      var reader = new FileReader();
      var that = this;
      reader.onload = (function(file) {
        return function(e) {
          var data = new Uint8Array(e.target.result);
          FS.writeFile(input_filepath, data, { encoding: 'binary' });
          Module.ccall('ConvertAndResample', 'number',
            ['string', 'string'],
            [input_filepath, input_display_filepath]);
          that.displayInput(input_display_filepath);
          if(that.worker) {
            that.worker.postMessage({'cmd': 'install_input',
              'input_filepath': input_filepath,
              'data': data});
          }
          else {
            Runner.filter.execute();
          }
        }
      })(input_file);
      reader.readAsArrayBuffer(input_file);
    }
  }
};


Runner.Filter.prototype.downloadOutput = function() {
  var output_path = '/raw/' + this.parameters.output_filename;
  var data = FS.readFile(output_path, { encoding: 'binary' });
  var blob = new Blob([data], {"type": "image\/png"});
  // From FileSaver
  saveAs(blob, this.parameters.output_filename);
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

  $('#exponent-slider').slider({
    precision: 1
  })
  .on('slide', function(ee) {
    Runner.filter.parameters.exponent = ee.value;
  });

  if(window.File && window.FileReader && window.FileList && window.Blob) {
    file_input = $('#file-input');
    file_input[0].disabled = "";
  }

  $('#download').submit(function(e) {
    e.preventDefault();
    Runner.filter.downloadOutput();
    return false;
  });

  $('#execute-button').on('click', function() {
    Runner.filter.execute();
  });
  $(document).keypress(function(press) {
    if(press.which === 13) {
      Runner.filter.execute();
    }
  });


  if(Runner.filter.worker) {
    Runner.filter.worker.addEventListener('message', function(e) {
      if(e.data.cmd !== undefined) {
        switch(e.data.cmd) {
        case 'execute':
          Runner.filter.execute();
          break;
        case 'set_progress':
          Runner.filter.setProgress(e.data.progress);
          break;
        default:
          console.error('Unknown message received from worker');
        }
      }
      else { // Returning processed output image data
        var output_filename = '/raw/' + Runner.filter.parameters.output_filename;
        FS.writeFile(output_filename, e.data.output_data, { encoding: 'binary' });
        Runner.filter.postExecute();
      }
    }, false);
  }
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
      $('#exponent-slider').slider('setValue', 2.0);
      Runner.filter.parameters.exponent = 2.0;
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
      $('#exponent-slider').slider('setValue', 2.0);
      Runner.filter.parameters.exponent = 2.0;
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
      $('#exponent-slider').slider('setValue', 2.0);
      Runner.filter.parameters.exponent = 2.0;
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
      $('#exponent-slider').slider('setValue', 2.0);
      Runner.filter.parameters.exponent = 2.0;
      break;
    // cCED
    case 3:
      $('#diffusion-time-slider').slider('setValue', 20.0);
      Runner.filter.parameters.diffusion_time = 20.0;
      $('#lambda-slider').slider('setValue', 0.02);
      Runner.filter.parameters.lambda = 0.02;
      $('#diffusion-type').val('cCED');
      Runner.filter.parameters.diffusion_type = 'cCED';
      $('#noise-scale').slider('setValue', 1.0);
      Runner.filter.parameters.noise_scale = 1.0;
      $('#feature-scale').slider('setValue', 2.0);
      Runner.filter.parameters.feature_scale = 2.0;
      $('#exponent-slider').slider('setValue', 2.0);
      Runner.filter.parameters.exponent = 2.0;
      break;
    // Isotropic
    case 4:
      $('#diffusion-time-slider').slider('setValue', 20.0);
      Runner.filter.parameters.diffusion_time = 20.0;
      $('#lambda-slider').slider('setValue', 0.02);
      Runner.filter.parameters.lambda = 0.02;
      $('#diffusion-type').val('Isotropic');
      Runner.filter.parameters.diffusion_type = 'Isotropic';
      $('#noise-scale').slider('setValue', 1.0);
      Runner.filter.parameters.noise_scale = 1.0;
      $('#feature-scale').slider('setValue', 2.0);
      Runner.filter.parameters.feature_scale = 2.0;
      $('#exponent-slider').slider('setValue', 2.0);
      Runner.filter.parameters.exponent = 2.0;
      break;
    default:
      console.error('Unknown subfigure: ' + figure);
    }
    Runner.filter.setInputFile('FingerPrint.png');
    break;
  // Lena
  case 6:
    switch(subfigure) {
    // cEED
    case 2:
      $('#diffusion-time-slider').slider('setValue', 2.0);
      Runner.filter.parameters.diffusion_time = 2.0;
      $('#lambda-slider').slider('setValue', 0.003);
      Runner.filter.parameters.lambda = 0.003;
      $('#diffusion-type').val('cEED');
      Runner.filter.parameters.diffusion_type = 'cEED';
      $('#noise-scale').slider('setValue', 1.0);
      Runner.filter.parameters.noise_scale = 1.0;
      $('#feature-scale').slider('setValue', 2.0);
      Runner.filter.parameters.feature_scale = 2.0;
      $('#exponent-slider').slider('setValue', 4.0);
      Runner.filter.parameters.exponent = 4.0;
      break;
    // cCED
    case 3:
      $('#diffusion-time-slider').slider('setValue', 2.0);
      Runner.filter.parameters.diffusion_time = 2.0;
      $('#lambda-slider').slider('setValue', 0.003);
      Runner.filter.parameters.lambda = 0.003;
      $('#diffusion-type').val('cCED');
      Runner.filter.parameters.diffusion_type = 'cCED';
      $('#noise-scale').slider('setValue', 1.0);
      Runner.filter.parameters.noise_scale = 1.0;
      $('#feature-scale').slider('setValue', 2.0);
      Runner.filter.parameters.feature_scale = 2.0;
      $('#exponent-slider').slider('setValue', 4.0);
      Runner.filter.parameters.exponent = 4.0;
      break;
    // Isotropic
    case 4:
      $('#diffusion-time-slider').slider('setValue', 2.0);
      Runner.filter.parameters.diffusion_time = 2.0;
      $('#lambda-slider').slider('setValue', 0.003);
      Runner.filter.parameters.lambda = 0.003;
      $('#diffusion-type').val('Isotropic');
      Runner.filter.parameters.diffusion_type = 'Isotropic';
      $('#noise-scale').slider('setValue', 1.0);
      Runner.filter.parameters.noise_scale = 1.0;
      $('#feature-scale').slider('setValue', 2.0);
      Runner.filter.parameters.feature_scale = 2.0;
      $('#exponent-slider').slider('setValue', 4.0);
      Runner.filter.parameters.exponent = 4.0;
      break;
    default:
      console.error('Unknown subfigure: ' + figure);
    }
    Runner.filter.setInputFile('Lena_Detail.png');
    break;
  // Oscillations and Triangle
  case 8:
    switch(subfigure) {
    // Oscillations cCED
    case 2:
      $('#diffusion-time-slider').slider('setValue', 20.0);
      Runner.filter.parameters.diffusion_time = 20.0;
      $('#lambda-slider').slider('setValue', 0.03);
      Runner.filter.parameters.lambda = 0.03;
      $('#diffusion-type').val('cCED');
      Runner.filter.parameters.diffusion_type = 'cCED';
      $('#noise-scale').slider('setValue', 1.0);
      Runner.filter.parameters.noise_scale = 1.0;
      $('#feature-scale').slider('setValue', 2.0);
      Runner.filter.parameters.feature_scale = 2.0;
      $('#exponent-slider').slider('setValue', 2.0);
      Runner.filter.parameters.exponent = 2.0;
      Runner.filter.setInputFile('Oscillations_Noisy.png');
      break;
    // Oscillations CED
    case 3:
      $('#diffusion-time-slider').slider('setValue', 20.0);
      Runner.filter.parameters.diffusion_time = 20.0;
      $('#lambda-slider').slider('setValue', 0.03);
      Runner.filter.parameters.lambda = 0.03;
      $('#diffusion-type').val('CED');
      Runner.filter.parameters.diffusion_type = 'CED';
      $('#noise-scale').slider('setValue', 1.0);
      Runner.filter.parameters.noise_scale = 1.0;
      $('#feature-scale').slider('setValue', 2.0);
      Runner.filter.parameters.feature_scale = 2.0;
      $('#exponent-slider').slider('setValue', 2.0);
      Runner.filter.parameters.exponent = 2.0;
      Runner.filter.setInputFile('Oscillations_Noisy.png');
      break;
    // Triangle cCED
    case 5:
      $('#diffusion-time-slider').slider('setValue', 5.0);
      Runner.filter.parameters.diffusion_time = 5.0;
      $('#lambda-slider').slider('setValue', 0.05);
      Runner.filter.parameters.lambda = 0.05;
      $('#diffusion-type').val('cEED');
      Runner.filter.parameters.diffusion_type = 'cEED';
      $('#noise-scale').slider('setValue', 1.0);
      Runner.filter.parameters.noise_scale = 1.0;
      $('#feature-scale').slider('setValue', 2.0);
      Runner.filter.parameters.feature_scale = 2.0;
      $('#exponent-slider').slider('setValue', 2.0);
      Runner.filter.parameters.exponent = 2.0;
      Runner.filter.setInputFile('Triangle.png');
      break;
    // Triangle CED
    case 6:
      $('#diffusion-time-slider').slider('setValue', 5.0);
      Runner.filter.parameters.diffusion_time = 5.0;
      $('#lambda-slider').slider('setValue', 0.05);
      Runner.filter.parameters.lambda = 0.05;
      $('#diffusion-type').val('EED');
      Runner.filter.parameters.diffusion_type = 'EED';
      $('#noise-scale').slider('setValue', 1.0);
      Runner.filter.parameters.noise_scale = 1.0;
      $('#feature-scale').slider('setValue', 2.0);
      Runner.filter.parameters.feature_scale = 2.0;
      $('#exponent-slider').slider('setValue', 2.0);
      Runner.filter.parameters.exponent = 2.0;
      Runner.filter.setInputFile('Triangle.png');
      break;
    default:
      console.error('Unknown subfigure: ' + figure);
    }
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
