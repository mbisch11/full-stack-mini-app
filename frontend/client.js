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
        console.log(parseRes);
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
        console.log(parseRes);
    } catch (e) {
        console.log(e);
    }
}