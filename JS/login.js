// Función para validar el inicio de sesión
function validarFormulario(event) {
    event.preventDefault(); // Evita el envío del formulario

    // Obtener valores
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Validar campos vacíos
    if (email === "" || password === "") {
        alert("Por favor, completa todos los campos.");
        return false;
    }

    // Verificar usuario
    const usuario = verificarUsuario(email, password);

    if (usuario) {
        alert("Inicio de sesión exitoso como " + usuario.userType.charAt(0).toUpperCase() + usuario.userType.slice(1));

        // Redirección automática según tipo
        if (usuario.userType === "admin") {
            window.location.href = "admin_dashboard.html";
        } else if (usuario.userType === "usuario") {
            window.location.href = "moduleClient.html";
        } else if (usuario.userType === "gerente") {
            window.location.href = "gerente_dashboard.html";
        } else {
            alert("Tipo de usuario no válido.");
        }

        // Limpiar campos
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
    } else {
        alert("Usuario no encontrado o datos incorrectos.");
    }

    return false;
}

// Verificar usuario (simulación)
function verificarUsuario(email, password) {
    const usuarios = [
        { email: "admin@finca.com", password: "1234", userType: "admin" },
        { email: "cliente@finca.com", password: "cliente123", userType: "usuario" },
        { email: "gerente@finca.com", password: "gerente123", userType: "gerente" }
    ];

    return usuarios.find(user => user.email === email && user.password === password);
}
