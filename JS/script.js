// URL de la API (si fuera necesario para obtener datos del usuario, aunque en este caso no lo es)
const API_PRODUCTOS = 'http://127.0.0.1:8000/api/Producto/';

let carrito = [];

// Función para obtener los encabezados de autenticación JWT
function getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert('Sesión expirada o no autenticado. Por favor, inicie sesión.');
        window.location.href = 'login.html';
        return null;
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Función para decodificar un token JWT (sin necesidad de librerías externas)
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

// --- Nueva función para cargar los datos del usuario ---
function cargarDatosUsuario() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        // Redirigir a login si no hay token
        alert('Sesión expirada. Por favor, inicie sesión de nuevo.');
        window.location.href = 'login.html';
        return;
    }

    const payload = parseJwt(token);
    if (payload && payload.username) {
        document.getElementById('nombreUsuario').innerText = payload.username;
        // La API puede devolver el tipo de usuario en el payload, por ejemplo, payload.rol
        // document.getElementById('tipoUsuario').value = payload.rol || 'Cliente';
    } else {
        console.error('Payload del token no válido o incompleto.');
    }
}

// Función para cargar los productos desde la API
async function cargarProductos() {
    const container = document.getElementById('productos-containerCatalogo');
    if (!container) return; 

    const headers = getAuthHeaders();
    if (!headers) return; 

    try {
        const res = await fetch(API_PRODUCTOS, { headers });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const productos = await res.json();
        
        container.innerHTML = ''; 
        
        productos.forEach(producto => {
            const productoDiv = document.createElement('div');
            productoDiv.classList.add('productoCatalogo');

            const nombreProducto = producto.nombre || 'Producto Desconocido';
            const precioProducto = parseFloat(producto.precioVenta).toFixed(2) || '0.00';
            const idProducto = producto.id_producto;

            productoDiv.innerHTML = `
                <span class="etiqueta2">${producto.estado === 'Activo' ? 'Disponible' : 'No disponible'}</span>
                <img src="Images/manzanas.jpeg" alt="${nombreProducto}" class="imagen-producto">
                <h3 class="producto-nombre">${nombreProducto}</h3>
                <p class="producto-precio">$${precioProducto}/kg</p>
                <div class="contenedor-carrito">
                    <button class="agregar-al-carrito" 
                            title="Agregar al Carrito" 
                            onclick="agregarAlCarrito(${idProducto}, '${nombreProducto}', ${precioProducto})">
                        <img src="Images/anadir-al-carrito.png" alt="Agregar al carrito" class="imagen-carrito">
                    </button>
                </div>
            `;
            container.appendChild(productoDiv);
        });

    } catch (error) {
        console.error('Error al cargar productos:', error);
        container.innerHTML = `<p>Error al cargar productos. Por favor, intente de nuevo más tarde.</p>`;
    }
}

// Lógica del carrito (sin cambios)
function agregarAlCarrito(id, nombre, precio) {
    const existente = carrito.find(p => p.id === id);
    if (existente) {
        existente.cantidad++;
        existente.total = existente.cantidad * existente.precio;
    } else {
        carrito.push({
            id, nombre, precio, cantidad: 1, total: precio
        });
    }
    actualizarCarrito();
}

function actualizarCarrito() {
    const tbody = document.getElementById('carrito-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    let total = 0;
    carrito.forEach((p) => {
        const fila = document.createElement('tr');
        fila.setAttribute('data-id', p.id);
        fila.innerHTML = `
            <td>${p.nombre}</td>
            <td>$${p.precio.toFixed(2)}</td>
            <td>${p.cantidad}</td>
            <td>$${p.total.toFixed(2)}</td>
            <td>
                <button onclick="eliminarFila(this)" style="background: none; border: none; cursor: pointer;">
                    <img src="Images/delete.png" alt="Eliminar" width="20" height="20">
                </button>
            </td>
        `;
        tbody.appendChild(fila);
        total += p.total;
    });
    const totalElement = document.getElementById('total-carrito');
    if (totalElement) {
        totalElement.innerText = total.toFixed(2);
    }
}

function eliminarFila(boton) {
    const fila = boton.closest('tr');
    const id = parseInt(fila.getAttribute('data-id'));
    carrito = carrito.filter(p => p.id !== id);
    actualizarCarrito();
}

function toggleCarrito() {
    const carritoSlide = document.getElementById('carritoSlide');
    if (carritoSlide) {
        carritoSlide.classList.toggle('hidden');
    }
}

function verCarrito() {
    alert('Funcionalidad de pedido aún no implementada.');
}

// Inicialización: Carga los datos del usuario y los productos
document.addEventListener('DOMContentLoaded', () => {
    cargarDatosUsuario();
    cargarProductos();
});

// Exporta las funciones para que estén disponibles globalmente en el HTML
window.agregarAlCarrito = agregarAlCarrito;
window.eliminarFila = eliminarFila;
window.toggleCarrito = toggleCarrito;
window.verCarrito = verCarrito;