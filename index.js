"use strict";

const SerialPort = require("serialport");
const http = require("http");
const fs = require("fs");
var latestV = "0";
var buffer = "";

var port = new SerialPort("COM4", {baudRate: 9600});
/*port.open(function (error){
  if (error) return console.log("Error: " + error.message);
});*/

port.on("readable", function (data){
  let read = port.read().toString();
  //console.log(read);
  buffer += read;
  for (let i = 0; i < buffer.length; i++){
    if (buffer[i] === "\n"){
      latestV = buffer.substr(0,i);
      //console.log(latestV);
      buffer = buffer.substr(i+1,buffer.length);
    }
  }
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
    response.write(String(latestV));
    response.end();
  }
});

server.listen(httpPort, "0.0.0.0", function(){
  console.log("Server running at http://" + hostname + ":" + httpPort);
  console.log(server.address());
})
