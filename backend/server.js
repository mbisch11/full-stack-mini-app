const express = require('express');
const cors = require('cors');
const fs = require('fs');
const environment = require('dotenv').config();
const app = express();
const port = 3000;

app.use(cors());

const userFilepath = "./storage/users.json"
const userInfoFilepath = "./storage/userInfo.json"
const groceryFilepath = "./storage/groceryLists.json"
const mealPlanFilepath = "./storage/mealPlanning.json"

app.get('/', (req, res) => {
    res.set('content-type', 'application/json');
    const response = {
        commands: {
            Credential : {
                'Signup': '/signup/:user/:pass',
                'Login': '/login/:user/:pass'
            },
            Search_API : {
                'Search for recipe by ingredient': '/isearch/:ingredients',
                'Search for recipe by name': '',
                'Get similar recipes': '',
                'Get random recipes': '',
                'Get ingredients by recipe id' : '',
                'Get nutrition by recipe id': '',
                'Search for ingredient by name': '/searchingredient/:ingredientName'
            },
            Grocery_List : {
                'Create grocery list' : '/groceryListCreate/:userId/:name',
                'Add item to grocery list' : '/groceryListAdd/:groceryListId/:ingredientID',
                'Delete an item from grocery list' : '/groceryListDeleteItem/:groceryListId/:ingredientID',
                'Delete a grocery list': '/groceryListDelete/:groceryListId'
            },
            Meal_Plan : {
                'Create meal plan for the week' : '',
                'Add meal to existing meal plan' : '',
                'Discard old meal plan' : '',
                'Remove meal from meal plan' : ''
            },
            User_Info : {
                'Add to meal plan count' : '',
                'Add to grocery count' : '',
                'Add to recipes cooked' : ''
            }
        }
    }
    res.send(response);
});

app.get('/signup/:user/:pass', (req, res) => {
    res.set('content-type', 'application/json');

    var isExistingUser = false;
    const paramUsername = req.params.user;
    const paramPassword = req.params.pass;
    
    const filecontent = fs.readFileSync(userFilepath, {encoding: "utf-8"});
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
        fs.writeFileSync(userFilepath, JSON.stringify(parseData));
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

    const filecontent = fs.readFileSync(userFilepath, {encoding: "utf-8"});
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

    const linkParams = req.params.ingredients.replace('/,/g', ',+');

    const url = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${process.env.SPOON_KEY}&ingredients=${linkParams}&number=2`;

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

app.get('/groceryListCreate/:userId/:name', async (req,res) => {
    res.set('content-type', 'application/json');

    listName = req.params.name.replace('/_/g', ' ')

    const filecontent = fs.readFileSync(groceryFilepath, {encoding: "utf-8"});
    const parseData = JSON.parse(filecontent);

    const newList = {
        "name" : listName,
        "userId": parseInt(req.params.userId),
        "id" : parseData.lists[parseData.lists.length - 1].id + 1 || 0,
        "items" : []
    }
    parseData.lists.push(newList);
    fs.writeFileSync(groceryFilepath, JSON.stringify(parseData));

    res.send(newList);
})

app.get('/groceryListAdd/:groceryListId/:ingredientID' , async (req, res) => {
    res.set('content-type', 'application/json');
    
    const url = `https://api.spoonacular.com/food/ingredients/${req.params.ingredientID}/information?apiKey=${process.env.SPOON_KEY}&amount=1`
    const ingredient = await fetch(url)
    if(!ingredient.ok){
        Console.error("Invalid ingredient sorry :(");
    }

    const parseIngredient = await ingredient.json();
    
    const newIngredient = {
        "id" : parseInt(parseIngredient.id),
        "name" : parseIngredient.name,
        "image" : `https://spoonacular.com/cdn/ingredients_250x250/${parseIngredient.image}`,
        "aisle" : parseIngredient.aisle
    }

    const filecontent = fs.readFileSync(groceryFilepath, {encoding: "utf-8"});
    const parseData = JSON.parse(filecontent);

    let editedList = null;
    parseData.lists.forEach(list => {
        if(list.id == req.params.groceryListId){
            list.items.push(newIngredient);
            editedList = list;
        }
    })
    fs.writeFileSync(groceryFilepath, JSON.stringify(parseData));

    res.send(editedList);
})

app.delete('/groceryListDeleteItem/:groceryListId/:ingredientID', async (req, res) => {
    res.set('content-type', 'application/json');

    const filecontent = fs.readFileSync(groceryFilepath, { encoding: 'utf-8' });
    const data = JSON.parse(filecontent);

    const groceryListId = parseInt(req.params.groceryListId);
    const ingredientID = parseInt(req.params.ingredientID);

    let newList = null

    data.lists.forEach(list => {
        if(list.id == groceryListId){
            list.items = list.items.filter(item => item.id != ingredientID);
            newList = list.items;
        }
    })

    fs.writeFileSync(groceryFilepath, JSON.stringify(data));
    res.send({
      message: `Ingredient ${ingredientID} removed successfully.`,
      updatedList: newList,
    });
});

app.delete('/groceryListDelete/:groceryListId', async (req, res) => {
    res.set('content-type', 'application/json');

    const filecontent = fs.readFileSync(groceryFilepath, { encoding: 'utf-8' });
    const data = JSON.parse(filecontent);

    const groceryListId = parseInt(req.params.groceryListId);

    data.lists = data.lists.filter(list => list.id != groceryListId);

    fs.writeFileSync(groceryFilepath, JSON.stringify(data));
    res.send({
        status: 200,
        message: `Grocery List ${groceryListId} removed successfully.`,
    });
});


app.listen(port, () => {
    console.log(`Running on port ${port} access at http://localhost:${port}/`)
});