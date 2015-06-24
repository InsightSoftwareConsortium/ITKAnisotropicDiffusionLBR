var Runner = function() {

  var that = this;
  var parameters = { InputFileName: 'Pacman.png',
    DiffusionTime: 20.0,
    Lambda: 0.05,
    DiffusionType: 'cEED',
    NoiseScale: 1.0,
    FeatureScale: 2.0 }

  this.setInputFile = function( fileName ) {
  }
}

Runner.prototype.runFilter = function() {
  var args = ['/Input/PacMan.png', '/Filtered.png',
          '20', '0.05', 'cEED', '3'];
  Module.callMain(args);
  var outputBits = FS.readFile('/Filtered.png', { encoding: 'binary' });
  var outputImageElement = document.getElementById("output-image");
  try {
    var blob = new Blob([outputBits], {"type": "image\/png"});
    window.URL = window.URL || window.webkitURL;
    outputImageElement.src = window.URL.createObjectURL(blob);
  } catch (err) { // in case blob / URL missing, fallback to data-uri
    console.log(err);
    var rawString = '';
    for(var i = 0; i < outputBits.length; ++i) {
      rawString += String.fromCharCode(outputBits[i]);
    }
    outputImageElement.src = 'data:image\/png;base64,' + btoa(rawString);
  }
  outputImageElement.style.visibility = 'visible';
}

var runner = new Runner();

$( window ).load( runner.runFilter );
