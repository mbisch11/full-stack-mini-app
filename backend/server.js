const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(cors());

const filepath = "../users.json"

app.get('/', (req, res) => {
    res.set('content-type', 'application/json');
    const response = {
        commands: {
            'Signup': '/signup/:user/:pass',
            'Login': '/login/:user/:pass'
        }
    }
    res.send(response);
});

app.get('/signup/:user/:pass', (req, res) => {
    res.set('content-type', 'application/json');

    var isExistingUser = false;
    const paramUsername = req.params.user;
    const paramPassword = req.params.pass;
    
    const filecontent = fs.readFileSync(filepath, {encoding: "utf-8"});
    const parseData = JSON.parse(filecontent);

    parseData.users.forEach(person => {
        if(person.username.toLowerCase() == paramUsername.toLowerCase() && person.password == paramPassword){
            isExistingUser = true
        }
    });

    if(!isExistingUser){
        parseData.users.push({
            username: paramUsername,
            password: paramPassword,
            id: parseData.users[parseData.users.length - 1].id + 1
        });
        fs.writeFileSync(filepath, JSON.stringify(parseData));
        res.send(parseData.users[parseData.users.length - 1]);
    }else{
        res.send({
            'user':null,
            'pass':null,
            'id':-1
        });
    }
});

app.get('/login/:user/:pass', (req, res) => {
    res.set('content-type', 'application/json');
    var validUser = false;
    var userData = null;

    const paramUsername = req.params.user;
    const paramPassword = req.params.pass;

    const filecontent = fs.readFileSync(filepath, {encoding: "utf-8"});
    const parseData = JSON.parse(filecontent);

    parseData.users.forEach(person => {
        if(person.username.toLowerCase() == paramUsername.toLowerCase() && person.password == paramPassword){
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
        });
    }
});

app.listen(port, () => {
    console.log(`Running on port ${port} access at http://localhost:${port}/`)
});