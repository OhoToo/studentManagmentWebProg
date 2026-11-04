import {apiRequest, login} from "./auth.js";

const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const message = document.querySelector("#auth-message");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = loginForm.querySelector("button");
    button.disabled = true;
    message.textContent = "";
    try {
        await login(loginForm.elements.username.value.trim(), loginForm.elements.password.value);
        location.replace("/");
    } catch (error) {
        message.textContent = error.message;
    } finally {
        button.disabled = false;
    }
});

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = registerForm.querySelector("button");
    button.disabled = true;
    message.textContent = "";
    try {
        const username = registerForm.elements.username.value.trim();
        await apiRequest("/api/auth/register", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                username,
                email: registerForm.elements.email.value.trim(),
                password: registerForm.elements.password.value
            })
        }, false);
        registerForm.reset();
        loginForm.elements.username.value = username;
        loginForm.elements.password.value = "";
        message.textContent = "Регистрация завершена. Войдите с вашим логином и паролем";
        loginForm.elements.password.focus();
    } catch (error) {
        message.textContent = error.message;
    } finally {
        button.disabled = false;
    }
});
