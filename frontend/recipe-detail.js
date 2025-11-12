const API_BASE_URL = "http://localhost:3000"

function getCurrentUser() {
  const userStr = sessionStorage.getItem("userSession")
  return userStr ? JSON.parse(userStr) : null
}

function navDashboard() {
  window.location.assign("dashboard.html")
}

function navUser() {
  window.location.assign("user.html")
}

function goBack() {
  window.location.assign("recipes.html")
}

window.onload = async () => {
  const user = getCurrentUser()
  if (!user) {
    window.location.assign("login.html")
    return
  }

  const urlParams = new URLSearchParams(window.location.search)
  const recipeId = urlParams.get("id")

  if (!recipeId) {
    alert("No recipe specified!")
    window.location.assign("recipes.html")
    return
  }

  await loadRecipeDetails(recipeId)
}

async function loadRecipeDetails(recipeId) {
  try {
    const res = await fetch(`${API_BASE_URL}/recipeinfo/${recipeId}`)
    if (!res.ok) throw new Error("Failed to load recipe details")

    const recipe = await res.json()
    displayRecipeDetails(recipe)
  } catch (e) {
    console.error(e)
    alert("Failed to load recipe details. Please try again.")
    window.location.assign("recipes.html")
  }
}

function displayRecipeDetails(recipe) {
  document.getElementById("recipeImage").src = recipe.image
  document.getElementById("recipeImage").alt = recipe.title
  document.getElementById("recipeName").textContent = recipe.title
  document.getElementById("readyInMinutes").textContent = recipe.readyInMinutes || "N/A"
  document.getElementById("servings").textContent = recipe.servings || "N/A"
  document.getElementById("healthScore").textContent = recipe.healthScore || "N/A"

  const summaryDiv = document.getElementById("recipeSummary")
  summaryDiv.innerHTML = recipe.summary || "No summary available."

  const ingredientsList = document.getElementById("ingredientsList")
  if (recipe.extendedIngredients && recipe.extendedIngredients.length > 0) {
    recipe.extendedIngredients.forEach((ingredient) => {
      const li = document.createElement("li")
      li.textContent = ingredient.original
      ingredientsList.appendChild(li)
    })
  } else {
    const li = document.createElement("li")
    li.textContent = "No ingredients available"
    ingredientsList.appendChild(li)
  }

  const instructionsDiv = document.getElementById("instructionsList")
  if (recipe.instructions) {
    instructionsDiv.innerHTML = recipe.instructions
  } else if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
    const steps = recipe.analyzedInstructions[0].steps
    const ol = document.createElement("ol")
    steps.forEach((step) => {
      const li = document.createElement("li")
      li.textContent = step.step
      ol.appendChild(li)
    })
    instructionsDiv.appendChild(ol)
  } else {
    instructionsDiv.textContent = "No instructions available."
  }

  const dietsContainer = document.getElementById("dietsContainer")
  if (recipe.diets && recipe.diets.length > 0) {
    recipe.diets.forEach((diet) => {
      const badge = document.createElement("span")
      badge.className = "dietBadge"
      badge.textContent = diet
      dietsContainer.appendChild(badge)
    })
  } else {
    dietsContainer.textContent = "No dietary information available"
  }
}
