const express = require('express');
const cors = require('cors');
const request = require('request');
const app = express();

app.use(cors());
app.use(express.static('static'));

app.get('/standups/:id', function(req, res, next) {
    getJson(`/standups/${req.params.id}.json`, res);
});

app.get('/standups/:id/items', function(req, res, next) {
    getJson(`/standups/${req.params.id}/items.json`, res);
});

app.get('/:id', function(req, res, next) {
   res.sendFile('/static/index.html', {root: __dirname});
});

app.listen(8080, () => {
    console.log('app is listening');
});

function getJson(path, res) {
    request(`http://whiteboard.pivotallabs.com/${path}`, (err, apiResponse, body) => {
        res.writeHeader(200, {"Content-Type": "text/json"});
        res.write(body);
        res.end();
    });
}
