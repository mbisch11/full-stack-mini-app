const express = require('express');
const cors = require('cors');
const fs = require('fs');
const environment = require('dotenv').config();
const app = express();
const port = 3000;

app.use(cors());

const filepath = "../users.json"

app.get('/', (req, res) => {
    res.set('content-type', 'application/json');
    const response = {
        commands: {
            'Signup': '/signup/:user/:pass',
            'Login': '/login/:user/:pass',
            'Search by ingredient': 'isearch/:ingredients'
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

app.get('/isearch/:ingredients', async (req, res) => {
    res.set('content-type', 'application/json');
    const url = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${process.env.SPOON_KEY}&ingredient=${req.params.ingredients}&number=1`;

    const searchResults = await fetch(url);
    if(!searchResults.ok){
        console.error("Error grabbing your search results, sorry :(");
    }

    parseResults = await searchResults.json();

    res.send(parseResults);
});

app.get('/searchingredient/:ingredientName', async (req, res) => {
    res.set('content-type', 'application/json');
    const url = `https://api.spoonacular.com/food/ingredients/search?apiKey=${process.env.SPOON_KEY}&query=${req.params.ingredientName}&number=25`;

    const searchResults = await fetch(url);
    if(!searchResults.ok){
        console.error("Error grabbing your search results, sorry :(");
    }

    parseResults = await searchResults.json();
    res.send(parseResults);
})

app.listen(port, () => {
    console.log(`Running on port ${port} access at http://localhost:${port}/`)
});