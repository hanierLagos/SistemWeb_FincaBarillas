document.getElementById("sobreNosotrosLink").addEventListener("click", function (event) {
    event.preventDefault();
    fetch("sobre-nosotros.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("contenido").innerHTML = data;
        });
});

// Espera a que todo el contenido del documento (HTML) esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {

    // Selecciona todos los elementos que tengan las clases 'boton-accion' o 'boton-secundario'
    const botones = document.querySelectorAll(".boton-accion, .boton-secundario");
    
    // Recorre cada uno de los botones encontrados
    botones.forEach(function (boton) {

        // Cuando el mouse pasa por encima del botón (hover)
        boton.addEventListener("mouseover", function () {
            // Agranda el botón ligeramente (5% más grande)
            boton.style.transform = "scale(1.05)";
            // Añade una transición suave de 0.3 segundos al efecto
            boton.style.transition = "transform 0.3s ease";
        });

        // Cuando el mouse sale del botón
        boton.addEventListener("mouseout", function () {
            // Regresa el botón a su tamaño original
            boton.style.transform = "scale(1)";
        });
    });
});


// Metodo para validar el inicio de sesión
function validarFormulario(event) {
    // Obtener los valores del formulario
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var userType = document.getElementById("user-type").value;

    // Validar si los campos están vacíos
    if (email === "" || password === "" || userType === "") {
        alert("Por favor, completa todos los campos.");
        return false;  // No enviar el formulario
    }

    // Simulación de validación del usuario 
    var usuarioValido = verificarUsuario(email, password, userType);  // Verificación de existencia de usuario

    // Redirigir a la página correspondiente si el usuario existe
    if (usuarioValido) {
        switch (userType) {
            case "admin":
                window.location.href = "admin_dashboard.html";  // Redirigir al administrador
                alert("Inicio de sesión con éxito como Administrador.");
                break;
            case "usuario":
                window.location.href = "moduleClient.html";  // Redirigir al cliente
                alert("Inicio de sesión con éxito como Cliente.");
                break;
            case "gerente":
                window.location.href = "gerente_dashboard.html";  // Redirigir al Reportero
                alert("Inicio de sesión con éxito como Gerente.");
                break;
            default:
                alert("Tipo de usuario no válido.");
                return false;
        }

        // Limpiar los campos del formulario después de una validación exitosa
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
        document.getElementById("user-type").selectedIndex = 0;  // Limpiar el combobox (restablecer a la opción por defecto)
    } else {
        alert("Usuario no existe o los datos son incorrectos.");
    }

    return false;  // No enviar el formulario, ya que el redireccionamiento se maneja con window.location.href
}

// Función para simular la verificación del usuario
function verificarUsuario(email, password, userType) {
    // Este es un ejemplo simple de validación. 
    // Simulación de usuarios existentes
    var usuarios = [
        { email: "admin@finca.com", password: "1234", userType: "admin" },
        { email: "cliente@finca.com", password: "cliente123", userType: "usuario" },
        { email: "gerente@finca.com", password: "gerente123", userType: "gerente" }
    ];

    // Buscar si el usuario existe en el arreglo
    var usuarioEncontrado = usuarios.find(function(usuario) {
        return usuario.email === email && usuario.password === password && usuario.userType === userType;
    });

    return usuarioEncontrado !== undefined;  // Si se encuentra el usuario, devuelve true
}

document.addEventListener('DOMContentLoaded', function () {
    let carrito = [];

    function agregarAlCarrito(button) {
        const producto = button.closest('.productoCatalogo');
        const nombre = producto.querySelector('.producto-nombre').innerText;
        const precioTexto = producto.querySelector('.producto-precio').innerText;
        const precio = parseFloat(precioTexto.replace(/[^\d.-]/g, ''));

        const existente = carrito.find(p => p.nombre === nombre);

        if (existente) {
            existente.cantidad++;
            existente.total = existente.cantidad * existente.precio;
        } else {
            carrito.push({
                nombre,
                precio,
                cantidad: 1,
                total: precio
            });
        }

        actualizarCarrito();
    }

    function actualizarCarrito() {
        const tbody = document.getElementById('carrito-body');
        tbody.innerHTML = '';

        let total = 0;

        carrito.forEach(p => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${p.nombre}</td>
                <td>$${p.precio.toFixed(2)}</td>
                <td>${p.cantidad}</td>
                <td>$${p.total.toFixed(2)}</td>
            `;
            tbody.appendChild(fila);
            total += p.total;
        });

        document.getElementById('total-carrito').innerText = total.toFixed(2);
    }

    document.querySelectorAll('.agregar-al-carrito').forEach(boton => {
        boton.addEventListener('click', function () {
            agregarAlCarrito(boton);
        });
    });
});

