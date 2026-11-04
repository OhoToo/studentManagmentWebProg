let refreshPromise = null;

function saveTokens(tokens) {
    sessionStorage.setItem("accessToken", tokens.accessToken);
    sessionStorage.setItem("refreshToken", tokens.refreshToken);
}

function logout() {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("username");
    location.replace("/html/authPage.html");
}

function getRole() {
    try {
        const token = sessionStorage.getItem("accessToken");
        const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(payload)).role;
    } catch {
        return "";
    }
}

function isAdmin() {
    return getRole() === "ADMIN";
}

function requireAuth(adminOnly = false) {
    if (!sessionStorage.getItem("accessToken") && !sessionStorage.getItem("refreshToken")) {
        location.replace("/html/authPage.html");
        return false;
    }
    if (adminOnly && !isAdmin()) {
        location.replace("/");
        return false;
    }
    return true;
}

function showSession() {
    const panel = document.createElement("div");
    panel.className = "session-panel";

    const user = document.createElement("span");
    user.textContent = `${sessionStorage.getItem("username") || "Пользователь"} (${getRole()})`;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn-cancel";
    button.textContent = "Выйти";
    button.addEventListener("click", logout);

    panel.append(user, button);
    document.querySelector("header").append(panel);
}

async function refreshTokens() {
    const refreshToken = sessionStorage.getItem("refreshToken");
    if (!refreshToken) {
        logout();
        throw new Error("Нужно войти в систему");
    }

    const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({refreshToken})
    });
    if (!response.ok) {
        logout();
        throw new Error("Срок входа истёк. Войдите снова");
    }
    saveTokens(await response.json());
}

async function apiRequest(url, options = {}, authorized = true) {
    const headers = new Headers(options.headers);
    if (authorized) {
        headers.set("Authorization", `Bearer ${sessionStorage.getItem("accessToken") || ""}`);
    }

    let response = await fetch(url, {...options, headers});
    if (authorized && response.status === 401) {
        if (!refreshPromise) {
            refreshPromise = refreshTokens().finally(() => { refreshPromise = null; });
        }
        await refreshPromise;
        headers.set("Authorization", `Bearer ${sessionStorage.getItem("accessToken")}`);
        response = await fetch(url, {...options, headers});
        if (response.status === 401) {
            logout();
            throw new Error("Нужно войти в систему заново");
        }
    }

    if (response.status === 204) return null;
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error || `Ошибка HTTP: ${response.status}`);
    }
    return result;
}

async function login(username, password) {
    const tokens = await apiRequest("/api/auth/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password})
    }, false);
    saveTokens(tokens);
    sessionStorage.setItem("username", username);
}

export {apiRequest, login, isAdmin, requireAuth, showSession};
