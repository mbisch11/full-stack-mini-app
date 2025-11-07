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

function logout() {
    sessionStorage.removeItem("userSession")
    window.location.assign("index.html")
}

window.onload = async () => {
    const user = getCurrentUser()

    if (!user) {
        window.location.assign("login.html")
        return
    }

    document.querySelector("#userName").textContent = user.username
    document.querySelector("#userId").textContent = user.id

    // Load user info
    try {
        const res = await fetch(`${API_BASE_URL}/userinfo/${user.id}`)
        if (!res.ok) throw new Error("Failed to load user info")

        const userInfo = await res.json()

        document.querySelector("#groceryCount").textContent = userInfo.groceryLists
        document.querySelector("#mealPlanCount").textContent = userInfo.mealPlans
        document.querySelector("#recipesCooked").textContent = userInfo.recipesCooked
        document.querySelector("#savedRecipesCount").textContent = userInfo.savedRecipes.length
    } catch (e) {
        console.error(e)
    }
}
