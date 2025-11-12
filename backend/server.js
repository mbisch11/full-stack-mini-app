const express = require("express")
const cors = require("cors")
const fs = require("fs")
const environment = require("dotenv").config()
const app = express()
const port = 3000

app.use(cors())

const userFilepath = "./storage/users.json"
const userInfoFilepath = "./storage/userInfo.json"
const groceryFilepath = "./storage/groceryLists.json"
const mealPlanFilepath = "./storage/mealPlanning.json"

app.get("/", (req, res) => {
    res.set("content-type", "application/json")
    const response = {
        commands: {
        Credential: {
            Signup: "/signup/:user/:pass",
            Login: "/login/:user/:pass",
        },
        Search_API: {
            "Search for recipe by ingredient": "/isearch/:ingredients",
            "Search for recipe by name": "/recipesearch/:recipeName",
            "Search for recipe by id": "/recipeinfo/:recipeId",
            "Get similar recipes": "/similarrecipes/:recipeId",
            "Get random recipes": "/randomrecipe",
            "Get recipe instructions": "/recipeinstructions/:recipeId",
            "Search for ingredient by name": "/searchingredient/:ingredientName",
        },
        Grocery_List: {
            "Create grocery list": "/groceryListCreate/:userId/:name",
            "Add item to grocery list": "/groceryListAdd/:groceryListId/:ingredientID",
            "Delete an item from grocery list": "/groceryListDeleteItem/:groceryListId/:ingredientID",
            "Delete a grocery list": "/groceryListDelete/:groceryListId",
            "Get grocery list": "/grocerylist/get/:userId",
            "Get grocery list by user ID": "/grocerylist/getbyuser/:userId",
        },
        Meal_Plan: {
            "Create meal plan for the week": "/mealplan/create/:userId/:startdate",
            "Add meal to existing meal plan": "mealplan/addmeal/:recipeId/:date/:mealplanId",
            "Discard old meal plan": "/mealplan/delete/:mealplanId",
            "Remove meal from meal plan": "/meaplan/deletemeal/:mealplanId/:recpieId",
            "Get meal plan": "/mealplan/get/:mealplanId",
            "Get meal plan by user ID with date checking": "/mealplan/getbyuser/:userId",
        },
        User_Info: {
            "Add to meal plan count": "/userInfo/mealplanadd/:userId",
            "Add to grocery count": "/userInfo/groceryadd/:userId",
            "Add to recipes cooked": "/userInfo/groceryadd/:userId",
            "Add to saved recipes": "/userInfo/addsavedrecipe/:userId/:recipeId",
            "Remove from saved recipes": "/userInfo/removesavedrecipe/:userId/:recipeId",
            "get user info": "/userinfo/:userId",
        },
        },
    }
    res.send(response)
})

app.get("/signup/:user/:pass", (req, res) => {
    res.set("content-type", "application/json")

    var isExistingUser = false
    const paramUsername = req.params.user
    const paramPassword = req.params.pass

    const filecontent = fs.readFileSync(userFilepath, { encoding: "utf-8" })
    const parseData = JSON.parse(filecontent)

    const userInfoFile = fs.readFileSync(userInfoFilepath, { encoding: "utf-8" })
    const userInfoData = JSON.parse(userInfoFile)

    parseData.users.forEach((person) => {
        if (person.username.toLowerCase() == paramUsername.toLowerCase() && person.password == paramPassword) {
        isExistingUser = true
        }
    })

    if (!isExistingUser) {
        const userID = parseData.users[parseData.users.length - 1].id + 1
        parseData.users.push({
        username: paramUsername,
        password: paramPassword,
        id: userID,
        })
        fs.writeFileSync(userFilepath, JSON.stringify(parseData))
        userInfoData.userInfo.push({
        userId: userID,
        groceryLists: 0,
        mealPlans: 0,
        recipesCooked: 0,
        savedRecipes: [],
        })
        fs.writeFileSync(userInfoFilepath, JSON.stringify(userInfoData))
        res.send(parseData.users[parseData.users.length - 1])
    } else {
        res.send({
        user: null,
        pass: null,
        id: -1,
        })
    }
})

app.get("/login/:user/:pass", (req, res) => {
    res.set("content-type", "application/json")
    var validUser = false
    var userData = null

    const paramUsername = req.params.user
    const paramPassword = req.params.pass

    const filecontent = fs.readFileSync(userFilepath, { encoding: "utf-8" })
    const parseData = JSON.parse(filecontent)

    parseData.users.forEach((person) => {
        if (person.username.toLowerCase() == paramUsername.toLowerCase() && person.password == paramPassword) {
        validUser = true
        userData = person
        }
    })

    if (validUser) {
        res.send(userData)
    } else {
        res.send({
        user: null,
        pass: null,
        id: -1,
        })
    }
})

app.get("/userInfo/mealplanadd/:userId", (req, res) => {
    res.set("application-type", "application/json")

    const filecontent = fs.readFileSync(userInfoFilepath, { encoding: "utf-8" })
    const parseData = JSON.parse(filecontent)
    const userId = Number.parseInt(req.params.userId)

    let userData = {
        userId: -1,
        groceryLists: 0,
        mealPlans: 0,
        recipesCooked: 0,
        savedRecipes: [],
    }
    parseData.userInfo.forEach((info) => {
        if (info.userId == userId) {
        info.mealPlans += 1
        userData = info
        }
    })

    fs.writeFileSync(userInfoFilepath, JSON.stringify(parseData))
    res.send(userData)
})

app.get("/userInfo/groceryadd/:userId", (req, res) => {
    res.set("application-type", "application/json")

    const filecontent = fs.readFileSync(userInfoFilepath, { encoding: "utf-8" })
    const parseData = JSON.parse(filecontent)
    const userId = Number.parseInt(req.params.userId)

    let userData = {
        userId: -1,
        groceryLists: 0,
        mealPlans: 0,
        recipesCooked: 0,
        savedRecipes: [],
    }
    parseData.userInfo.forEach((info) => {
        if (info.userId == userId) {
        info.groceryLists += 1
        userData = info
        }
    })

    fs.writeFileSync(userInfoFilepath, JSON.stringify(parseData))
    res.send(userData)
})

app.get("/userInfo/recipecooked/:userId", (req, res) => {
    res.set("application-type", "application/json")

    const filecontent = fs.readFileSync(userInfoFilepath, { encoding: "utf-8" })
    const parseData = JSON.parse(filecontent)
    const userId = Number.parseInt(req.params.userId)

    let userData = {
        userId: -1,
        groceryLists: 0,
        mealPlans: 0,
        recipesCooked: 0,
        savedRecipes: [],
    }
    parseData.userInfo.forEach((info) => {
        if (info.userId == userId) {
        info.recipesCooked += 1
        userData = info
        }
    })

    fs.writeFileSync(userInfoFilepath, JSON.stringify(parseData))
    res.send(userData)
})

app.get("/userInfo/addsavedrecipe/:userId/:recipeId", async (req, res) => {
    res.set("application-type", "application/json")

    const filecontent = fs.readFileSync(userInfoFilepath, { encoding: "utf-8" })
    const parseData = JSON.parse(filecontent)
    const userId = Number.parseInt(req.params.userId)
    const recipeId = Number.parseInt(req.params.recipeId)
    const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${process.env.SPOON_KEY}`
    let userData = {
        userId: -1,
        groceryLists: 0,
        mealPlans: 0,
        recipesCooked: 0,
        savedRecipes: [],
    }

    const response = await fetch(url)
    if (!response.ok) {
        console.error("Error getting your recipe :(")
    }
    const recipe = await response.json()
    const savedRecipe = {
        id: recipe.id,
        name: recipe.title,
        image: recipe.image,
    }

    parseData.userInfo.forEach((info) => {
        if (info.userId == userId) {
        info.savedRecipes.push(savedRecipe)
        userData = info
        }
    })

    fs.writeFileSync(userInfoFilepath, JSON.stringify(parseData))
    res.send(userData)
})

app.get("/userInfo/removesavedrecipe/:userId/:recipeId", (req, res) => {
    res.set("application-type", "application/json")

    const filecontent = fs.readFileSync(userInfoFilepath, { encoding: "utf-8" })
    const parseData = JSON.parse(filecontent)
    const userId = Number.parseInt(req.params.userId)
    const recipeId = Number.parseInt(req.params.recipeId)
    let userData = {
        userId: -1,
        groceryLists: 0,
        mealPlans: 0,
        recipesCooked: 0,
        savedRecipes: [],
    }

    parseData.userInfo.forEach((info) => {
        if (info.userId == userId) {
        info.savedRecipes = info.savedRecipes.filter((recipe) => recipe.id != recipeId)
        userData = info
        }
    })

    fs.writeFileSync(userInfoFilepath, JSON.stringify(parseData))
    res.send(userData)
})

app.get("/userinfo/:userId", (req, res) => {
    res.set("content-type", "application/json")
    const filecontent = fs.readFileSync(userInfoFilepath, { encoding: "utf-8" })
    const parseData = JSON.parse(filecontent)
    const userId = Number.parseInt(req.params.userId)
    let userData = {
        userId: -1,
        groceryLists: 0,
        mealPlans: 0,
        recipesCooked: 0,
        savedRecipes: [],
    }

    parseData.userInfo.forEach((user) => {
        if (user.userId == userId) {
        userData = user
        }
    })

    res.send(userData)
})

app.get("/recipesearch/:recipeName", async (req, res) => {
    res.set("content-type", "application/json")

    const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.SPOON_KEY}&query=${req.params.recipeName}&number=10`

    const searchResults = await fetch(url)
    if (!searchResults.ok) {
        console.error("Error grabbing your search results, sorry :(")
    }

    const parseResults = await searchResults.json()
    res.send(parseResults)
})

app.get("/similarrecipes/:recipeId", async (req, res) => {
    res.set("content-type", "application/json")

    const url = `https://api.spoonacular.com/recipes/${req.params.recipeId}/similar?apiKey=${process.env.SPOON_KEY}&number=5`

    const similar = await fetch(url)
    if (!similar.ok) {
        console.error("Error getting similar results, sorry :(")
    }

    const similarParse = await similar.json()
    res.send(similarParse)
})

app.get("/randomrecipe", async (req, res) => {
    res.set("content-type", "application/json")

    const url = `https://api.spoonacular.com/recipes/random?apiKey=${process.env.SPOON_KEY}&number=9`

    const results = await fetch(url)
    if (!results.ok) {
        console.error("Error getting your random recipes, weirdo >:[")
    }

    const randomParse = await results.json()
    res.send(randomParse)
})

app.get("/recipeinfo/:recipeId", async (req, res) => {
    res.set("content-type", "application/json")

    const url = `https://api.spoonacular.com/recipes/${req.params.recipeId}/information?apiKey=${process.env.SPOON_KEY}&includeNutrition=true`

    const results = await fetch(url)
    if (!results.ok) {
        console.error("Error getting recipe information, weirdo >:[")
    }

    const recipe = await results.json()
    res.send(recipe)
})

app.get("/recipeinstructions/:recipeId", async (req, res) => {
    res.set("content-type", "application/json")
    const url = `https://api.spoonacular.com/recipes/${req.params.recipeId}/analyzedInstructions?apiKey=${process.env.SPOON_KEY}`

    const results = await fetch(url)
    if (!results.ok) {
        console.error("Error getting recipe instructions, weirdo >:[")
    }

    const recipe = await results.json()
    res.send(recipe)
})

app.get("/isearch/:ingredients", async (req, res) => {
    res.set("content-type", "application/json")

    const linkParams = req.params.ingredients.replace(/,/g, ",+")

    const url = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${process.env.SPOON_KEY}&ingredients=${linkParams}&number=15`

    const searchResults = await fetch(url)
    if (!searchResults.ok) {
        console.error("Error grabbing your search results, sorry :(")
    }

    const parseResults = await searchResults.json()

    res.send(parseResults)
})

app.get("/searchingredient/:ingredientName", async (req, res) => {
    res.set("content-type", "application/json")
    const url = `https://api.spoonacular.com/food/ingredients/search?apiKey=${process.env.SPOON_KEY}&query=${req.params.ingredientName}`

    const searchResults = await fetch(url)
    if (!searchResults.ok) {
        console.error("Error grabbing your search results, sorry :(")
    }

    const parseResults = await searchResults.json()
    res.send(parseResults)
})

app.get("/groceryListCreate/:userId/:name", (req, res) => {
    res.set("content-type", "application/json")

    const listName = req.params.name.replace(/_/g, " ")

    const filecontent = fs.readFileSync(groceryFilepath, { encoding: "utf-8" })
    const parseData = JSON.parse(filecontent)

    const newList = {
        name: listName,
        userId: Number.parseInt(req.params.userId),
        id: parseData.lists[parseData.lists.length - 1].id + 1 || 0,
        items: [],
    }
    parseData.lists.push(newList)
    fs.writeFileSync(groceryFilepath, JSON.stringify(parseData))

    res.send(newList)
})

app.get("/grocerylist/get/:groceryListId", (req, res) => {
    res.set("content-type", "application/json")
    const filecontent = fs.readFileSync(groceryFilepath, { encoding: "utf-8" })
    const parseData = JSON.parse(filecontent)

    const returnList = {
        name: null,
        userId: -1,
        id: -1,
        items: [],
    }

    const groceryListId = Number.parseInt(req.params.groceryListId)
    parseData.lists.forEach((list) => {
        if (list.id == groceryListId) {
        returnList.name = list.name
        returnList.userId = list.userId
        returnList.id = list.id
        returnList.items = list.items
        }
    })

    res.send(returnList)
})

app.get("/grocerylist/getbyuser/:userId", (req, res) => {
    res.set("content-type", "application/json")
    const filecontent = fs.readFileSync(groceryFilepath, { encoding: "utf-8" })
    const parseData = JSON.parse(filecontent)
    const userId = Number.parseInt(req.params.userId)

    // Find the user's grocery list
    const userList = parseData.lists.find((list) => list.userId === userId)

    if (userList) {
        res.send(userList)
    } else {
        res.send({ id: -1 }) // Indicates no list found
    }
})

app.get("/groceryListAdd/:groceryListId/:ingredientID", async (req, res) => {
    res.set("content-type", "application/json")

    const url = `https://api.spoonacular.com/food/ingredients/${req.params.ingredientID}/information?apiKey=${process.env.SPOON_KEY}&amount=1`
    const ingredient = await fetch(url)
    if (!ingredient.ok) {
        console.error("Invalid ingredient sorry :(")
    }

    const parseIngredient = await ingredient.json()

    const newIngredient = {
        id: Number.parseInt(parseIngredient.id),
        name: parseIngredient.name,
        image: `https://spoonacular.com/cdn/ingredients_250x250/${parseIngredient.image}`,
        aisle: parseIngredient.aisle,
    }

    const filecontent = fs.readFileSync(groceryFilepath, { encoding: "utf-8" })
    const parseData = JSON.parse(filecontent)

    let editedList = null
    parseData.lists.forEach((list) => {
        if (list.id == req.params.groceryListId) {
        list.items.push(newIngredient)
        editedList = list
        }
    })
    fs.writeFileSync(groceryFilepath, JSON.stringify(parseData))

    res.send(editedList)
})

app.delete("/groceryListDeleteItem/:groceryListId/:ingredientID", (req, res) => {
    res.set("content-type", "application/json")

    const filecontent = fs.readFileSync(groceryFilepath, { encoding: "utf-8" })
    const data = JSON.parse(filecontent)

    const groceryListId = Number.parseInt(req.params.groceryListId)
    const ingredientID = Number.parseInt(req.params.ingredientID)

    let newList = null

    data.lists.forEach((list) => {
        if (list.id == groceryListId) {
        list.items = list.items.filter((item) => item.id != ingredientID)
        newList = list
        }
    })

    fs.writeFileSync(groceryFilepath, JSON.stringify(data))
    res.send({
        message: `Ingredient ${ingredientID} removed successfully.`,
        updatedList: newList,
    })
})

app.delete("/groceryListDelete/:groceryListId", (req, res) => {
    res.set("content-type", "application/json")

    const filecontent = fs.readFileSync(groceryFilepath, { encoding: "utf-8" })
    const data = JSON.parse(filecontent)

    const groceryListId = Number.parseInt(req.params.groceryListId)

    data.lists = data.lists.filter((list) => list.id != groceryListId)

    fs.writeFileSync(groceryFilepath, JSON.stringify(data))
    res.send({
        status: 200,
        message: `Grocery List ${groceryListId} removed successfully.`,
    })
    })

    app.get("/mealplan/get/:mealplanId", (req, res) => {
    res.set("content-type", "application/json")

    const filecontent = fs.readFileSync(mealPlanFilepath, { encoding: "utf-8" })
    const parseData = JSON.parse(filecontent)

    let returnPlan = {
        meals: [],
        user: -1,
        start: "0000-00-00",
        id: -1,
    }

    const mealPlanId = Number.parseInt(req.params.mealplanId)
    parseData.plans.forEach((plan) => {
        if (plan.id == mealPlanId) {
        returnPlan = plan
        }
    })

    res.send(returnPlan)
    })

    app.get("/mealplan/getbyuser/:userId", (req, res) => {
    res.set("content-type", "application/json")
    const filecontent = fs.readFileSync(mealPlanFilepath, { encoding: "utf-8" })
    const parseData = JSON.parse(filecontent)
    const userId = Number.parseInt(req.params.userId)
    const today = new Date().toISOString().split("T")[0]

    // Find the user's meal plan
    const userPlan = parseData.plans.find((plan) => plan.user === userId)

    if (userPlan) {
        // Check if the plan's start date is current
        if (userPlan.start !== today) {
        // Date is old, clear the meals and update the date
        userPlan.meals = []
        userPlan.start = today
        fs.writeFileSync(mealPlanFilepath, JSON.stringify(parseData))
        }
        res.send(userPlan)
    } else {
        res.send({ id: -1 }) // Indicates no plan found
    }
})

app.get("/mealplan/create/:userId", (req, res) => {
    res.set("content-type", "application/json")

    const filecontent = fs.readFileSync(mealPlanFilepath, { encoding: "utf-8" })
    const parseData = JSON.parse(filecontent)

    const today = new Date().toISOString().split('T')[0];

    const plan = {
        meals: [],
        user: parseInt(req.params.userId),
        id: parseData.plans[parseData.plans.length - 1].id + 1,
        date: today
    }

    parseData.plans.push(plan)
    fs.writeFileSync(mealPlanFilepath, JSON.stringify(parseData))
    res.send([plan])
})

app.get("/mealplan/addmeal/:recipeId/:date/:mealplanId", async (req, res) => {
    res.set("content-type", "application/json")

    const url = `https://api.spoonacular.com/recipes/${req.params.recipeId}/information?apiKey=${process.env.SPOON_KEY}`

    const results = await fetch(url)
    if (!results.ok) {
        console.error("Error getting your recipe, weirdo >:[")
    }

    const meal = await results.json()
    const newMeal = {
        id: meal.id,
        name: meal.title,
        image: meal.image,
        servings: meal.servings,
        date: req.params.date,
    }

    const filecontent = fs.readFileSync(mealPlanFilepath, { encoding: "utf-8" })
    const parseData = JSON.parse(filecontent)

    const mealplanId = Number.parseInt(req.params.mealplanId)
    parseData.plans.forEach((plan) => {
        if (plan.id == mealplanId) {
        plan.meals.push(newMeal)
        }
    })
    fs.writeFileSync(mealPlanFilepath, JSON.stringify(parseData))
    res.send(newMeal)
})

app.delete("/mealplan/delete/:mealplanId", async (req, res) => {
    res.set("content-type", "application/json")
    const filecontent = fs.readFileSync(mealPlanFilepath, { encoding: "utf-8" })
    const parseData = JSON.parse(filecontent)

    const mealPlanId = Number.parseInt(req.params.mealplanId)
    parseData.plans = parseData.plans.filter((plan) => plan.id != mealPlanId)
    fs.writeFileSync(mealPlanFilepath, JSON.stringify(parseData))
    res.send({
        status: 200,
        message: `Meal plan id:${mealPlanId} has been successfully deleted`,
    })
})

app.delete("/meaplan/deletemeal/:mealplanId/:recpieId", (req, res) => {
    const filecontent = fs.readFileSync(mealPlanFilepath, { encoding: "utf-8" })
    const parseData = JSON.parse(filecontent)

    const mealPlanId = Number.parseInt(req.params.mealplanId)
    const recipeId = Number.parseInt(req.params.recpieId)

    parseData.plans.forEach((plan) => {
        if (plan.id == mealPlanId) {
        plan.meals = plan.meals.filter((meal) => meal.id != recipeId)
        res.send(plan)
        }
    })
    fs.writeFileSync(mealPlanFilepath, JSON.stringify(parseData))
    res.send({
        status: 200,
        message: `Meal plan id:${mealPlanId} has been successfully deleted`,
    })
})

app.listen(port, () => {
    console.log(`Running on port ${port} access at http://localhost:${port}/`)
})