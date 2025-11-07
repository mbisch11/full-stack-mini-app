function navLogin() {
    window.location.assign("login.html")
}

function navSignup() {
    window.location.assign("signup.html")
}

function navUser() {
    window.location.assign("user.html")
}

function navDashboard() {
    window.location.assign("dashboard.html")
}

const API_BASE_URL = "http://localhost:3000"

function getCurrentUser() {
    const userStr = sessionStorage.getItem("userSession")
    return userStr ? JSON.parse(userStr) : null
}

window.onload = () => {
    const user = getCurrentUser()
    if (user && document.querySelector("#userName")) {
        document.querySelector("#userName").textContent = user.username
    }
}

async function loginUser() {
    event.preventDefault()
    const username = document.querySelector("#usernameLogForm").value
    const password = document.querySelector("#passwordLogForm").value

    try {
        const res = await fetch(`${API_BASE_URL}/login/${username}/${password}`)
        if (!res.ok) {
            throw new Error(`Error fetching login: ${res.status}`)
        }

        const parseRes = await res.json()
        if (parseRes.id < 0) {
            alert("Incorrect username or password")
        } else {
        sessionStorage.setItem("userSession", JSON.stringify(parseRes))
        window.location.assign("dashboard.html")
        }   
    } catch (e) {
        console.error(e)
        alert("Login failed. Please try again.")
    }
}

async function signupUser() {
    event.preventDefault()
    const username = document.querySelector("#usernameForm").value
    const password = document.querySelector("#passwordForm").value

    try {
        const res = await fetch(`${API_BASE_URL}/signup/${username}/${password}`)
        if (!res.ok) {
            throw new Error(`Error fetching signup: ${res.status}`)
        }

        const parseRes = await res.json()
        if (parseRes.id < 0) {
            alert("Username already exists")
        } else {
            sessionStorage.setItem("userSession", JSON.stringify(parseRes))
            window.location.assign("dashboard.html")
        }
    } catch (e) {
        console.error(e)
        alert("Signup failed. Please try again.")
    }
}

function logout() {
    sessionStorage.removeItem("userSession")
    window.location.assign("index.html")
}
