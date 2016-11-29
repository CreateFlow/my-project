var ssi = require("node-ssi");

var inputDirectory = "./src/template/module";
var outputDirectory = "./src/views";
var matcher = "/**/*.html";

var includes = new ssi(inputDirectory, outputDirectory, matcher);
includes.compile();