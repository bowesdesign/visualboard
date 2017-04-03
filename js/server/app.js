console.log('app is running');

const http = require("http");
const request = require("request");

http.createServer((req, res) => {
    console.log("I got pinged");

    request('http://whiteboard.pivotallabs.com/standups/11/items.json', (err, apiResponse, body) => {
        res.writeHeader(200, {"Content-Type": "text/json"});
        res.write(body);
        res.end();
    });
}).listen(8080);
