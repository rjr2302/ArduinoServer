"use strict";

const SerialPort = require("serialport");
const http = require("http");
const fs = require("fs");
var latestV = 0;

var port = new SerialPort(process.argv[0] || "COM4", {baudRate: 9600});
port.open(function (error){
  if (error) return console.log("Error: " + error.message);
});

port.on("data", function (data){
  latestV = data;
});

const httpPort = 5555;
const hostname = "localhost";
const server = http.createServer(function(request, response){
  let file = request.url;
  if (file === "/") {
    response.setHeader("Content-Type", "text/html");
    fs.readFile("index.html", function(error, html){
      if (!error){
        response.statusCode = 200;
        response.write(html);
        response.end();
      }
      else{
        response.statusCode = 500; //Internal server error
        response.end("Unable to load website.");
      }
    });
  }
  else if (file === "/voltage") {
    response.setHeader("Content-Type", "text/plain");
    response.statusCode = 200;
    response.write(latestV);
    response.end();
  }
});

server.listen(port, hostname, function(){
  console.log("Server running at http://" + hostname + ":" + port);
  console.log(server.address());
})
