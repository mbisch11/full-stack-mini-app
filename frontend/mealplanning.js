const API_BASE_URL = "http://localhost:3000"

function getCurrentUser() {
    const userStr = sessionStorage.getItem("userSession")
    return userStr ? JSON.parse(userStr) : null
}

let currentMealPlan = null
let searchResults = []
const allMealPlans = []

window.onload = async () => {
    const user = getCurrentUser()
    if (!user) {
        window.location.assign("login.html")
        return
    }

    await loadOrCreateMealPlan()
}

async function loadOrCreateMealPlan() {
    const user = getCurrentUser()

    try {
        // Check if user already has a meal plan (backend will check date)
        const res = await fetch(`${API_BASE_URL}/mealplan/getbyuser/${user.id}`)
        if (!res.ok) throw new Error("Failed to fetch meal plan")

        const existingPlan = await res.json()

        if (existingPlan && existingPlan.id !== -1) {
        // User already has a plan (backend already checked/updated date)
        currentMealPlan = existingPlan
        displayMealPlan()
        } else {
        // No existing plan, create a new one
        await createMealPlan()
        }
    } catch (e) {
        console.error(e)
        // If there's an error, try creating a new plan
        await createMealPlan()
    }
}

async function createMealPlan() {
    const user = getCurrentUser()
    const today = new Date().toISOString().split("T")[0]

    try {
        const res = await fetch(`${API_BASE_URL}/mealplan/create/${user.id}/${today}`)
        if (!res.ok) throw new Error("Failed to create meal plan")

        const data = await res.json()
        currentMealPlan = data[0]

        await fetch(`${API_BASE_URL}/userInfo/mealplanadd/${user.id}`)

        displayMealPlan()
    } catch (e) {
        console.error(e)
        alert("Failed to load meal plan")
    }
}

function updateSearchPlaceholder() {
    const searchType = document.querySelector('input[name="searchType"]:checked').value
    const searchInput = document.getElementById("searchInput")

    if (searchType === "name") {
        searchInput.placeholder = "Enter a recipe name"
    } else {
        searchInput.placeholder = "Enter ingredients (comma separated)"
    }
}

async function searchRecipes() {
    const query = document.getElementById("searchInput").value.trim()
    if (!query) return alert("Please enter a search term!")

    const searchType = document.querySelector('input[name="searchType"]:checked').value

    try {
        let res
        if (searchType === "name") {
        res = await fetch(`${API_BASE_URL}/recipesearch/${encodeURIComponent(query)}`)
        } else {
        const ingredients = query.replace(/,\s*/g, ",")
        res = await fetch(`${API_BASE_URL}/isearch/${encodeURIComponent(ingredients)}`)
        }
        if (!res.ok) {
        throw new Error("Failed to search recipes")
        }

        const data = await res.json()
        if (searchType === "name") {
        searchResults = data.results || []
        } else {
        searchResults = data || []
        }

        displaySearchResults()
    } catch (e) {
        console.error(e)
        alert("Search failed. Please try again.")
    }
}

function displaySearchResults() {
    const list = document.getElementById("searchResults")
    list.innerHTML = ""

    if (searchResults.length === 0) {
        list.innerHTML = '<li style="text-align: center; color: #666;">No recipes found</li>'
        return
    }

    searchResults.forEach((recipe) => {
        const li = document.createElement("li")
        const recipeTitle = recipe.title || recipe.name || "Unknown Recipe"
        const recipeImage = recipe.image || "/placeholder.svg?height=60&width=60"
        const recipeId = recipe.id

        li.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;cursor: pointer;" onclick="viewRecipe(${recipe.id})">
                    <img src="${recipeImage}" alt="${recipeTitle}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
                    <div style="flex: 1;">
                    <strong>${recipeTitle}</strong>
                    </div>
                    <button onclick="addMealToPlan(${recipeId})" style="padding: 6px 12px; background-color: #050573;">
                    Add to Plan
                    </button>
                </div>
                `
        list.appendChild(li)
    })
}

async function addMealToPlan(recipeId) {
    const date = new Date().toISOString().split("T")[0]

    try {
        const addRes = await fetch(`${API_BASE_URL}/mealplan/addmeal/${recipeId}/${date}/${currentMealPlan.id}`)
        if (!addRes.ok) {
        throw new Error("Failed to add meal")
        }
        const meal = await addRes.json()
        currentMealPlan.meals.push(meal)

        displayMealPlan()
        alert(`${meal.name} added to your meal plan!`)
    } catch (e) {
        console.error(e)
        alert("Failed to add meal")
    }
}

function displayMealPlan() {
    const list = document.getElementById("mealList")
    list.innerHTML = ""

    if (!currentMealPlan || !currentMealPlan.meals || currentMealPlan.meals.length === 0) {
        list.innerHTML = '<li style="text-align: center; color: #666;">No meals planned yet</li>'
        return
    }

    currentMealPlan.meals.forEach((meal) => {
        const li = document.createElement("li")
        li.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; cursor: pointer;" onclick="viewRecipe(${meal.id})">
                    <img src="${meal.image}" alt="${meal.name}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
                    <div style="flex: 1;">
                        <strong>${meal.name}</strong>
                        <div style="font-size: 0.875rem; color: #666;">
                            ${meal.servings} servings • ${meal.date}
                        </div>
                    </div>
                    <button onclick="removeMeal(${meal.id})" style="padding: 6px 12px; background-color: #dc2626;">
                        Remove
                    </button>
                </div>
            `
        list.appendChild(li)
    })
}

function viewRecipe(recipeId) {
    window.location.assign(`recipe-detail.html?id=${recipeId}`)
}

async function removeMeal(recipeId) {
    try {
        const res = await fetch(`${API_BASE_URL}/meaplan/deletemeal/${currentMealPlan.id}/${recipeId}`, {
        method: "DELETE",
        })
        if (!res.ok) throw new Error("Failed to remove meal")

        currentMealPlan = await res.json()
        displayMealPlan()
    } catch (e) {
        console.error(e)
        alert("Failed to remove meal")
    }
}
