"use strict";

const SerialPort = require("serialport");
const http = require("http");
const fs = require("fs");
var latest = {voltage:0, time:Date.now()};
var buffer = "";

//console.log(process.argv)
var printVoltage = false;
if(process.argv[2] === "print") printVoltage = true;

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
      let v = buffer.substr(0,i);
      latest = {voltage:Number(v)||0, time:Date.now()};
      if(printVoltage) console.log(v);
      buffer = buffer.substr(i+1,buffer.length);
      break;
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
    response.setHeader("Content-Type", "text/json");
    response.statusCode = 200;
    response.write(JSON.stringify(latest));
    //console.log(request.headers);
    response.end();
  }
});

server.listen(httpPort, "0.0.0.0", function(){
  console.log("Server running at http://" + hostname + ":" + httpPort);
  console.log(server.address());
})
