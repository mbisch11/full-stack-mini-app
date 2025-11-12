const API_BASE_URL = "http://localhost:3000"

function getCurrentUser() {
	const userStr = sessionStorage.getItem("userSession")
	return userStr ? JSON.parse(userStr) : null
}

let currentGroceryList = null
let searchResults = []

window.onload = async () => {
	const user = getCurrentUser()
	if (!user) {
		window.location.assign("login.html")
		return
	}

	await loadOrCreateGroceryList()
}

async function loadOrCreateGroceryList() {
	const user = getCurrentUser()

	try {
		// Check if user already has a grocery list
		const res = await fetch(`${API_BASE_URL}/grocerylist/getbyuser/${user.id}`)
		if (!res.ok) throw new Error("Failed to fetch grocery list")

		const existingList = await res.json()

		if (existingList && existingList.id !== -1) {
		// User already has a list, use it
		currentGroceryList = existingList
		displayGroceryList()
		} else {
		// No existing list, create a new one
		await createGroceryList()
		}
	} catch (e) {
		console.error(e)
		// If there's an error, try creating a new list
		await createGroceryList()
	}
}

async function createGroceryList() {
	const user = getCurrentUser()
	const listName = "My_Grocery_List"

	try {
		const res = await fetch(`${API_BASE_URL}/groceryListCreate/${user.id}/${listName}`)
		if (!res.ok) throw new Error("Failed to create grocery list")

		currentGroceryList = await res.json()

		// Increment user's grocery list count
		await fetch(`${API_BASE_URL}/userInfo/groceryadd/${user.id}`)

		displayGroceryList()
	} catch (e) {
		console.error(e)
		alert("Failed to create grocery list")
	}
}

async function searchIngredients() {
	const query = document.getElementById("itemInput").value.trim()
	if (!query) return alert("Please enter an item name!")

	try {
		const res = await fetch(`${API_BASE_URL}/searchingredient/${encodeURIComponent(query)}`)
		if (!res.ok) throw new Error("Failed to search ingredients")

		const data = await res.json()
		searchResults = data.results || []

		displaySearchResults()
	} catch (e) {
		console.error(e)
		alert("Failed to search ingredients")
	}
}

function displaySearchResults() {
	const resultsSection = document.getElementById("searchResultsSection")
	const list = document.getElementById("searchResults")
	list.innerHTML = ""

	if (searchResults.length === 0) {
		list.innerHTML = '<li style="text-align: center; color: #666;">No ingredients found</li>'
		resultsSection.style.display = "block"
		return
	}

	resultsSection.style.display = "block"

	searchResults.forEach((ingredient) => {
		const li = document.createElement("li")
		li.innerHTML = `
			<div style="display: flex; align-items: center; gap: 12px;">
				<img src="${ingredient.image}" alt="${ingredient.name}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
				<div style="flex: 1;">
				<strong>${ingredient.name}</strong>
				<div style="font-size: 0.875rem; color: #666;">${ingredient.aisle || "N/A"}</div>
				</div>
				<button onclick="addItemToList(${ingredient.id})" style="padding: 6px 12px; background-color: #050573; color: white; border: none; border-radius: 6px; cursor: pointer;">
				Add to List
				</button>
			</div>
			`
		list.appendChild(li)
	})
}

async function addItemToList(ingredientId) {
	try {
		const addRes = await fetch(`${API_BASE_URL}/groceryListAdd/${currentGroceryList.id}/${ingredientId}`)
		if (!addRes.ok) throw new Error("Failed to add item")

		currentGroceryList = await addRes.json()

		displayGroceryList()
		document.getElementById("itemInput").value = ""
		const addedIngredient = searchResults.find((ing) => ing.id === ingredientId)
		if (addedIngredient) {
		alert(`${addedIngredient.name} added to your grocery list!`)
		}
	} catch (e) {
		console.error(e)
		alert("Failed to add item")
	}
}

function displayGroceryList() {
	const list = document.getElementById("itemList")
	list.innerHTML = ""

	if (!currentGroceryList || !currentGroceryList.items || currentGroceryList.items.length === 0) {
		list.innerHTML = '<li style="text-align: center; color: #666;">No items in your list yet</li>'
		return
	}

	currentGroceryList.items.forEach((item) => {
		const li = document.createElement("li")
		li.innerHTML = `
					<div style="display: flex; align-items: center; gap: 12px;">
						<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
						<div style="flex: 1;">
							<strong>${item.name}</strong>
							<div style="font-size: 0.875rem; color: #666;">${item.aisle}</div>
						</div>
						<button onclick="removeItem(${item.id})" style="padding: 6px 12px; background-color: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer;">
							Remove
						</button>
					</div>
				`
		list.appendChild(li)
	})
}

async function removeItem(ingredientId) {
	try {
		const res = await fetch(`${API_BASE_URL}/groceryListDeleteItem/${currentGroceryList.id}/${ingredientId}`, {
		method: "DELETE",
		})
		if (!res.ok) throw new Error("Failed to remove item")

		const data = await res.json()
		currentGroceryList.items = data.updatedList
		displayGroceryList()
	} catch (e) {
		console.error(e)
		alert("Failed to remove item")
	}
}
