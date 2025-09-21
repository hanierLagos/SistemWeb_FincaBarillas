// Este script gestiona el proceso de inicio de sesión de un usuario.
// Su función es autenticar al usuario con tokens JWT, almacenar el token de acceso
// y redirigir a la página correcta según el estado de superusuario.

// Se asocia la función 'handleLogin' al evento de envío del formulario con el ID 'loginForm'.
document.getElementById("loginForm").addEventListener("submit", handleLogin);

/**
 * Función asíncrona que maneja el envío del formulario de inicio de sesión.
 * Detiene el comportamiento predeterminado del formulario y gestiona la autenticación.
 * @param {Event} event - El evento de envío del formulario.
 */
async function handleLogin(event) {
    // Se evita que el formulario se envíe de forma tradicional.
    event.preventDefault();

    // Se obtienen los valores de los campos de email y contraseña.
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Se valida que los campos no estén vacíos.
    if (email === "" || password === "") {
        alert("Por favor, complete todos los campos.");
        return;
    }

    try {
        // Se realiza una solicitud HTTP POST al endpoint de la API para obtener el token.
        const response = await fetch("http://127.0.0.1:8000/api/token/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: email,
                password: password,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Credenciales incorrectas.");
        }

        const data = await response.json();
        const accessToken = data.access;
        localStorage.setItem("accessToken", accessToken);

        console.log("Token de acceso:", accessToken);
        alert("¡Inicio de sesión exitoso! Redirigiendo...");

        // --- Lógica de redirección simplificada ---
        // Se decodifica el token para obtener el 'payload'.
        const payload = parseJwt(accessToken);
        console.log("Contenido del payload del token:", payload);

        // Se verifica si el usuario es un superusuario.
        // Se asume que el 'payload' del token contiene el campo 'is_superuser'.
        if (payload && payload.is_superuser) {
            // El superusuario es redirigido al panel de administrador.
            window.location.href = "admin_dashboard.html";
        } else {
            // Todos los demás usuarios son redirigidos al módulo del cliente.
            window.location.href = "moduleClient.html";
        }

    } catch (error) {
        console.error("Fallo en el inicio de sesión:", error);
        alert(`Error: ${error.message}`);
    }
}

/**
 * Función auxiliar para decodificar un token JWT.
 * @param {string} token - El token JWT.
 * @returns {object|null} El payload del token decodificado, o null.
 */
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}