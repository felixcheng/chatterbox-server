/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */
// var queryString = require( "querystring" );

//need to check the url and install it
var url = require( "url" );
var fs = require("fs");
var path = require("path");
var allMessages = [];

var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

var contentT = {
  "/scripts/app.js": "text/javascript",
  "/scripts/config.js": "text/javascript",
  "/bower_components/handlebars/handlebars.min.js": "text/javascript",
  "/bower_components/underscore/underscore-min.js": "text/javascript",
  "/bower_components/underscore/underscore-min.map": "text/javascript",
  "/bower_components/jquery/jquery.min.js": "text/javascript",
  "/bower_components/jquery/jquery.min.map": "text/javascript",
  "/styles/styles.css": "text/css"
};

var sendUrlResponse = function(url, response){
  response.writeHead(200, {
    'Content-Type': contentT[url]
  });
  var file = fs.createReadStream(__dirname + "/client" + url);
  file.pipe(response);
}

var sendResponse = function(statusCode, content, response) {
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = "text/plain";
  response.writeHead(statusCode, headers);
  response.end(content);
};

var initializeMessages = function(){
  fs.readFile(path.join(__dirname + "/client/messages.json"), {encoding: 'utf-8'}, function(error, data) {
    if (error) {
      console.log('ERROR READING FILE');
    } else {
      allMessages = JSON.parse(data);
    }
  });
};

var writeMessage = function(newMessage) {
  var filepath = path.join(__dirname + "/client/messages.json");
  allMessages.push(newMessage);

  fs.writeFile(filepath, JSON.stringify(allMessages), {encoding: 'utf-8'}, function(err, data) {
    if(err) {
      console.log("Error: " + err);
    } else {
      console.log("File saved");
    }
  });
};

var postMsg = function(request, response){  
  var body = '';
  request.on('data', function (data) {
    body += data;
  });

  request.on('end', function () {
    writeMessage(JSON.parse(body));
  });
  sendResponse(200, "Hello world!", response);
}

var getMsg = function(request, response){
  response.writeHead(200, {
    'Content-Type': 'text/html'
  });
  var file = fs.createReadStream(__dirname + "/client/index.html");
  file.pipe(response);

}

var otherResponse= function(link, response){
  if (contentT[link]){
    sendUrlResponse(link, response); 
  } else {
    sendResponse(404, "Resource not found", response);
  }
}

initializeMessages();

var handleRequest = function(request, response) {
  /* the 'request' argument comes from nodes http module. It includes info about the
  request - such as what URL the browser is requesting. */

   var coreUrl = url.parse(request.url);
   var urlPath = coreUrl.pathname;

  /* Documentation for both request and response can be found at
   * http://nodemanual.org/0.8.14/nodejs_ref_guide/http.html */
  
  if (urlPath === '/1/classes/chatterbox'){
    if(request.method === 'POST'){
      postMsg(request, response);
    }

    else if (request.method === 'GET') {
      var msgJson = JSON.stringify(allMessages);
      sendResponse(200, msgJson, response);
    } else {
      sendResponse(200, "Hello world!", response);
    }

  } else if (urlPath === '/'){
    if (request.method === 'GET') {
      getMsg(request, response);
    }

  } else{
    otherResponse(urlPath, response);
  }

  console.log("Serving request type " + request.method + " for url " + path);

};


module.exports = handleRequest;
