const express = require('express');
const cors = require('cors');
const request = require('request');
const app = express();

app.use(cors());

app.get('/data', function(req, res, next) {
    console.log("I got pinged");

    request('http://whiteboard.pivotallabs.com/standups/11/items.json', (err, apiResponse, body) => {
        res.writeHeader(200, {"Content-Type": "text/json"});
        res.write(body);
        res.end();
    });
});

app.listen(8080, () => {
    console.log('app is listening');
});
