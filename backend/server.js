const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { start } = require('repl');
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
                'Search for recipe by name': '/recipesearch/:recipeName',
                'Search for recipe by id': '/recipeinfo/:recipeId',
                'Get similar recipes': '/similarrecipes/:recipeId',
                'Get random recipes': '/randomrecipe',
                'Get recipe instructions': '/recipeinstructions/:recipeId',
                'Search for ingredient by name': '/searchingredient/:ingredientName'
            },
            Grocery_List : {
                'Create grocery list' : '/groceryListCreate/:userId/:name',
                'Add item to grocery list' : '/groceryListAdd/:groceryListId/:ingredientID',
                'Delete an item from grocery list' : '/groceryListDeleteItem/:groceryListId/:ingredientID',
                'Delete a grocery list': '/groceryListDelete/:groceryListId',
                'Get grocery list' : '/grocerylist/get/:groceryListId'
            },
            Meal_Plan : {
                'Create meal plan for the week' : '/mealplan/create/:userId/:startdate',
                'Add meal to existing meal plan' : 'mealplan/addmeal/:recipeId/:date/:mealplanId',
                'Discard old meal plan' : '/mealplan/delete/:mealplanId',
                'Remove meal from meal plan' : '/meaplan/deletemeal/:mealplanId/:recpieId',
                'Get meal plan' : '/mealplan/get/:mealplanId'
            },
            User_Info : {
                'Add to meal plan count' : '',
                'Add to grocery count' : '',
                'Add to recipes cooked' : '',
                'Add to saved recipes' : '',
                'Remove from saved recipes' : '',
                'Get saved recipes' : '',
                'get user info' : ''
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

    const userInfoFile = fs.readFileSync(userInfoFilepath, {encoding: "utf-8"});
    const userInfoData = JSON.parse(userInfoFile);

    parseData.users.forEach(person => {
        if(person.username.toLowerCase() == paramUsername.toLowerCase() && person.password == paramPassword){
            isExistingUser = true
        }
    });

    if(!isExistingUser){
        let userID = parseData.users[parseData.users.length - 1].id + 1
        parseData.users.push({
            username: paramUsername,
            password: paramPassword,
            id: userID
        });
        fs.writeFileSync(userFilepath, JSON.stringify(parseData));
        userInfoData.userInfo.push({
            userId : userID,
            groceryLists : 0,
            mealPlans : 0,
            recipesCooked : 0,
            savedRecipes : []
        })
        fs.writeFileSync(userInfoFilepath, JSON.stringify(userInfoData));
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

app.get('/recipesearch/:recipeName', async (req,res) => {
    res.set('content-type', 'application/json');

    const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.SPOON_KEY}&query=${req.params.recipeName}&number=10`

    const searchResults = await fetch(url);
    if(!searchResults.ok){
        console.error("Error grabbing your search results, sorry :(");
    }

    parseResults = await searchResults.json();
    res.send(parseResults);
});

app.get('/similarrecipes/:recipeId', async (req,res) => {
    res.set('content-type', 'application/json');
    
    const url = `https://api.spoonacular.com/recipes/${req.params.recipeId}/similar?apiKey=${process.env.SPOON_KEY}&number=5`;
    
    const similar = await fetch(url);
    if(!similar.ok){
        console.error("Error getting similar results, sorry :(");
    }
    
    similarParse = await similar.json();
    res.send(similarParse);
});

app.get('/randomrecipe', async (req,res) => {
    res.set('content-type', 'application/json');

    const url = `https://api.spoonacular.com/recipes/random?apiKey=${process.env.SPOON_KEY}&number=9`

    const results = await fetch(url);
    if(!results.ok){
        console.error("Eror getting your random recipes, weirdo >:[");
    }

    randomParse = await results.json();
    res.send(randomParse);
});

app.get('/recipeinfo/:recipeId', async (req,res) => {
    res.set('content-type', 'application/json');

    const url = `https://api.spoonacular.com/recipes/${req.params.recipeId}/information?apiKey=${process.env.SPOON_KEY}&includeNutrition=true`

    const results = await fetch(url);
    if(!results.ok){
        console.error("Eror getting your random recipes, weirdo >:[");
    }

    recipe = await results.json();
    res.send(recipe);
});

app.get('/recipeinstructions/:recipeId', async (req,res) => {
    res.set('content-type', 'application/json');
    const url = `https://api.spoonacular.com/recipes/${req.params.recipeId}/analyzedInstructions?apiKey=${process.env.SPOON_KEY}`

    const results = await fetch(url);
    if(!results.ok){
        console.error("Eror getting your random recipes, weirdo >:[");
    }

    recipe = await results.json();
    res.send(recipe);
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
});

app.get('/groceryListCreate/:userId/:name', (req,res) => {
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
});

app.get('/grocerylist/get/:groceryListId', (req,res) => {
    res.set('content-type', 'application/json');
    const filecontent = fs.readFileSync(groceryFilepath, {encoding: "utf-8"});
    const parseData = JSON.parse(filecontent);

    const returnList = {
        name : null,
        userId : -1,
        id : -1,
        items : []
    }

    groceryListId = parseInt(req.params.groceryListId);
    parseData.lists.forEach(list => {
        if(list.id == groceryListId){
            returnList = list;
        }
    })

    res.send(returnList);
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
});

app.delete('/groceryListDeleteItem/:groceryListId/:ingredientID', (req, res) => {
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

app.delete('/groceryListDelete/:groceryListId', (req, res) => {
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

app.get('/mealplan/get/:mealplanId', (req,res) => {
    res.set('content-type', 'application/json');

    const filecontent = fs.readFileSync(mealPlanFilepath, {encoding: "utf-8"});
    const parseData = JSON.parse(filecontent);

    let returnPlan = {
        meals: [],
        user: -1,
        start: "0000-00-00",
        id: -1
    }

    const mealPlanId = parseInt(req.params.mealplanId);
    parseData.plans.forEach(plan => {
        if(plan.id == mealPlanId){
            returnPlan = plan;
        }
    })

    res.send(returnPlan);
}) 

app.get('/mealplan/create/:userId/:startdate', (req,res) => {
    res.set('content-type','application/json');

    const filecontent = fs.readFileSync(mealPlanFilepath, {encoding: "utf-8"});
    const parseData = JSON.parse(filecontent);

    const plan = {
        meals : [],
        user : parseInt(req.params.userId),
        start : req.params.startdate,
        id : parseData.plans[parseData.plans.length - 1].id + 1
    }

    parseData.plans.push(plan)
    fs.writeFileSync(mealPlanFilepath, JSON.stringify(parseData));
    res.send([plan]);
});

app.get('/mealplan/addmeal/:recipeId/:date/:mealplanId', async (req,res) => {
    res.set('content-type', 'application/json');

    const url = `https://api.spoonacular.com/recipes/${req.params.recipeId}/information?apiKey=${process.env.SPOON_KEY}`

    const results = await fetch(url);
    if(!results.ok){
        console.error("Eror getting your random recipes, weirdo >:[");
    }

    meal = await results.json();
    const newMeal = {
        id : meal.id,
        name : meal.title,
        image : meal.image,
        servings : meal.servings,
        date : req.params.date
    }

    const filecontent = fs.readFileSync(mealPlanFilepath, {encoding: "utf-8"});
    const parseData = JSON.parse(filecontent);

    const mealplanId = parseInt(req.params.mealplanId)
    parseData.plans.forEach(plan => {
        if(plan.id == mealplanId){
            plan.meals.push(newMeal);
        }
    })
    fs.writeFileSync(mealPlanFilepath, JSON.stringify(parseData));
    res.send(newMeal);
})

app.delete('/mealplan/delete/:mealplanId', async (req,res) => {
    res.set('content-type', 'application/json');
    const filecontent = fs.readFileSync(mealPlanFilepath, {encoding: "utf-8"});
    const parseData = JSON.parse(filecontent);

    const mealPlanId = parseInt(req.params.mealplanId);
    parseData.plans = parseData.plans.filter(plan => plan.id != mealPlanId);
    fs.writeFileSync(mealPlanFilepath, JSON.stringify(parseData));
    res.send({
        status : 200,
        message : `Meal plan id:${mealPlanId} has been successfully deleted`
    })
})

app.delete('/meaplan/deletemeal/:mealplanId/:recpieId', (req,res) => {
    res.set('content-type', 'application/json');
    const filecontent = fs.readFileSync(mealPlanFilepath, {encoding: 'utf-8'});
    const parseData = JSON.parse(filecontent);

    const mealPlanId = parseInt(req.params.mealplanId);
    const recipeId = parseInt(req.params.recpieId);

    parseData.plans.forEach(plan => {
        if(plan.id == mealPlanId){
            plan.meals = plan.meals.filter(meal => meal.id != recipeId);
            res.send(plan);
        }
    })
})

app.listen(port, () => {
    console.log(`Running on port ${port} access at http://localhost:${port}/`)
});