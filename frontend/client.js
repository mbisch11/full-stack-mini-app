function navLogin(){
    window.location.assign("login.html");
}

function navSignup(){
    window.location.assign("signup.html");
}

function navUser(){
    window.location.assign("user.html");
}

function navDashboard(){
    window.location.assign("dashboard.html");
}

window.onload = function(){
    user = JSON.parse(sessionStorage.getItem("userSession"));
    console.log(user);

    document.querySelector("#userName").textContent = user.username;
};

async function loginUser(){
    event.preventDefault();
    const username = document.querySelector("#usernameLogForm").value;
    const password = document.querySelector("#passwordLogForm").value;

    try {
        const res =  await fetch(`http://localhost:3000/login/${username}/${password}`);
        if(!res.ok){
            throw new Error(`Error fetching login: ${res.status}`);
        }

        const parseRes = await res.json();
        if(parseRes.id < 0){
            console.error("Incorrect Login information")
        }else{
            sessionStorage.setItem("userSession", JSON.stringify(parseRes));
            window.location.assign("dashboard.html")
        }
    } catch (e) {
        console.log(e);
    }
}

async function signupUser(){
    event.preventDefault();
    const username = document.querySelector("#usernameForm").value;
    const password = document.querySelector("#passwordForm").value;

    try {
        const res =  await fetch(`http://localhost:3000/signup/${username}/${password}`);
        if(!res.ok){
            throw new Error(`Error fetching login: ${res.status}`);
        }

        const parseRes = await res.json();
        if(parseRes.id < 0){
            console.error("Incorrect Login information")
        }else{
            sessionStorage.setItem("userSession", parseRes);
            window.location.assign("dashboard.html")
        }
    } catch (e) {
        console.log(e);
    }
}