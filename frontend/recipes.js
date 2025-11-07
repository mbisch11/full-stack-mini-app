const API_BASE_URL = "http://localhost:3000"

function getCurrentUser() {
    const userStr = sessionStorage.getItem("userSession")
    return userStr ? JSON.parse(userStr) : null
}

let savedRecipes = []
let searchResults = []

window.onload = async () => {
    const user = getCurrentUser()
    if (!user) {
        window.location.assign("login.html")
        return
    }

    await loadUserInfo()
    await loadRandomRecipes()
}

async function loadUserInfo() {
    const user = getCurrentUser()
    try {
        const res = await fetch(`${API_BASE_URL}/userinfo/${user.id}`)
        if (!res.ok) throw new Error("Failed to load user info")

        const userInfo = await res.json()
        savedRecipes = userInfo.savedRecipes || []
        displaySavedRecipes()
    } catch (e) {
        console.error(e)
    }
}

async function loadRandomRecipes() {
    try {
        const res = await fetch(`${API_BASE_URL}/randomrecipe`)
        if (!res.ok) throw new Error("Failed to load random recipes")

        const data = await res.json()
        searchResults = data.recipes || []
        displaySearchResults()
    } catch (e) {
        console.error(e)
        alert("Failed to load recipes")
  }
}

async function searchRecipes() {
    const query = document.getElementById("recipeInput").value.trim()
    if (!query) return alert("Please enter a recipe name!")

    try {
        const res = await fetch(`${API_BASE_URL}/recipesearch/${encodeURIComponent(query)}`)
        if (!res.ok) throw new Error("Failed to search recipes")

        const data = await res.json()
        searchResults = data.results || []
        displaySearchResults()
    } catch (e) {
        console.error(e)
        alert("Search failed. Please try again.")
  }
}

function displaySearchResults() {
    const list = document.getElementById("recipeList")
    list.innerHTML = ""

    searchResults.forEach((recipe) => {
        const li = document.createElement("li")
        li.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="${recipe.image}" alt="${recipe.title}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
                    <div style="flex: 1;">
                        <strong>${recipe.title}</strong>
                    </div>
                    <button onclick="saveRecipe(${recipe.id}, '${recipe.title.replace(/'/g, "\\'")}', '${recipe.image}')" style="padding: 6px 12px;">
                        Save
                    </button>
                </div>
            `
        list.appendChild(li)
    })
}

function displaySavedRecipes() {
    const list = document.getElementById("savedRecipeList")
    if (!list) return

    list.innerHTML = ""

    savedRecipes.forEach((recipe) => {
        const li = document.createElement("li")
        li.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="${recipe.image}" alt="${recipe.name}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
                    <div style="flex: 1;">
                        <strong>${recipe.name}</strong>
                    </div>
                    <button onclick="removeRecipe(${recipe.id})" style="padding: 6px 12px; background-color: #dc2626;">
                        Remove
                    </button>
                </div>
            `
        list.appendChild(li)
    })
}

async function saveRecipe(recipeId, recipeName, recipeImage) {
    const user = getCurrentUser()

    try {
        const res = await fetch(`${API_BASE_URL}/userInfo/addsavedrecipe/${user.id}/${recipeId}`)
        if (!res.ok) throw new Error("Failed to save recipe")

        const userInfo = await res.json()
        savedRecipes = userInfo.savedRecipes || []
        displaySavedRecipes()
        alert(`${recipeName} saved!`)
    } catch (e) {
        console.error(e)
        alert("Failed to save recipe")
    }
}

async function removeRecipe(recipeId) {
    const user = getCurrentUser()

    try {
        const res = await fetch(`${API_BASE_URL}/userInfo/removesavedrecipe/${user.id}/${recipeId}`)
        if (!res.ok) throw new Error("Failed to remove recipe")

        const userInfo = await res.json()
        savedRecipes = userInfo.savedRecipes || []
        displaySavedRecipes()
    } catch (e) {
        console.error(e)
        alert("Failed to remove recipe")
    }
}
