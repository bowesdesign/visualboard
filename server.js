const express = require('express');
const cors = require('cors');
const request = require('request');
const app = express();

app.use(cors());
app.use(express.static('static'));

app.get('/data', function(req, res, next) {
    request('http://whiteboard.pivotallabs.com/standups/11/items.json', (err, apiResponse, body) => {
        res.writeHeader(200, {"Content-Type": "text/json"});
        res.write(body);
        res.end();
    });
});

app.get('/', function(req, res, next) {
   res.sendFile('/static/index.html', {root: __dirname});
});

app.listen(8080, () => {
    console.log('app is listening');
});
