const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

app.use(cors);

const fs = require('fs');
const filepath = "../users.json"

app.get('/', (req, res) => {
    res.set('content-type', 'application/json');
    const response = {
        this: 'is',
        a: 'response'
    }
    res.send(response);
});

app.get('/signup/:user/:pass', (req, res) => {
    res.set('content-type', 'application/json');
    const filecontent = fs.readFileSync(filepath, {encoding: "utf-8"});
    console.log(JSON.parse(filecontent));
});

app.listen(port, () => {
    console.log(`Running on port ${port} access at http://localhost:${port}/`)
})