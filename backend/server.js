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

    const username = req.params.user;
    const password = req.params.pass;
    
    const filecontent = fs.readFileSync(filepath, {encoding: "utf-8"});
    console.log(JSON.parse(filecontent));
});

app.get('/login/:user/:pass', (req, res) => {
    res.set('content-type', 'application/json');
    var validUser = false;
    const userData = null;

    const username = req.params.user;
    const password = req.params.pass;

    const filecontent = fs.readFileSync(filepath, {encoding: "utf-8"});
    const parseData = JSON.parse(filecontent);

    parseData.array.forEach(person => {
        if(person.user == username && person.pass == password){
            validUser = true;
            userData = person;
        }
    });

    if(validUser){
        res.send(userData);
    }else{
        res.send({
            'user':null,
            'pass':null,
            'id':-1
        })
    }
});

app.listen(port, () => {
    console.log(`Running on port ${port} access at http://localhost:${port}/`)
})