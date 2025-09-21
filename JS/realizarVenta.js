// URLS de las APIs
const API_PRODUCTOS = 'http://127.0.0.1:8000/api/Producto/';
const API_VENTAS = 'http://127.0.0.1:8000/api/ventas/';
const API_DETALLE_VENTA = 'http://127.0.0.1:8000/api/detalleVenta/';
const API_CLIENTES = 'http://127.0.0.1:8000/api/Cliente/';

// DOM Elements
const tablaProductos = document.getElementById('productosDisponibles');
const detalleVenta = document.getElementById('detalleVenta');
const inputNumeroVenta = document.getElementById('numeroVenta');
const inputFechaVenta = document.getElementById('fechaVenta');
const inputMontoTotal = document.getElementById('montoTotal');
const inputDescuento = document.getElementById('descuento');
const selectCliente = document.getElementById('cliente');
const metodoPago = document.getElementById('metodoPago');
const btnFinalizar = document.querySelector('.btn-finalizar');

let productosDisponibles = [];
let productosDetalle = [];

// --- Nueva función para obtener los encabezados de autenticación JWT ---
function getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert("Sesión expirada o no autenticado. Por favor, inicie sesión.");
        window.location.href = "login.html";
        return null;
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Cargar productos desde la API
async function cargarProductos() {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
        const res = await fetch(API_PRODUCTOS, { headers });
        if (!res.ok) throw new Error('Error al cargar productos');
        const data = await res.json();
        productosDisponibles = data.filter(p => p.estado === 'Activo');
        renderizarProductos();
    } catch (error) {
        console.error('Error cargando productos:', error);
    }
}

function renderizarProductos() {
    tablaProductos.innerHTML = '';
    productosDisponibles.forEach(producto => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${producto.nombre}</td>
            <td>${parseFloat(producto.precioVenta).toFixed(2)}</td>
            <td>${producto.CantidadDisponible}</td>
            <td><button onclick="agregarProducto(${producto.id_producto}, '${producto.nombre}', ${producto.precioVenta}, ${producto.CantidadDisponible})">➕</button></td>
        `;
        tablaProductos.appendChild(tr);
    });
}

// Cargar clientes
async function cargarClientes() {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
        const res = await fetch(API_CLIENTES, { headers });
        if (!res.ok) throw new Error('Error al cargar clientes');
        const data = await res.json();
        selectCliente.innerHTML = '<option value="">Seleccione un cliente</option>';
        data.forEach(cliente => {
            const opt = document.createElement('option');
            opt.value = cliente.id;
            opt.textContent = `${cliente.nombres} ${cliente.apellidos} (${cliente.codigo})`;
            selectCliente.appendChild(opt);
        });
    } catch (error) {
        console.error('Error cargando clientes:', error);
    }
}

// Obtener número de venta
async function obtenerSiguienteNumeroVenta() {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
        const res = await fetch(API_VENTAS, { headers });
        if (!res.ok) throw new Error('Error al obtener el número de venta');
        const data = await res.json();
        const ultimoNumero = data.reduce((max, v) => {
            const num = parseInt(v.numero_venta);
            return num > max ? num : max;
        }, 0);
        inputNumeroVenta.value = ultimoNumero + 1;
    } catch (error) {
        console.error('Error al obtener el siguiente número de venta:', error);
        inputNumeroVenta.value = 1;
    }
}

// Agregar producto
function agregarProducto(id, nombre, precio, disponible) {
    const cantidad = prompt(`Cantidad a vender (disponible: ${disponible}):`);
    const cantidadInt = parseInt(cantidad);

    if (isNaN(cantidadInt) || cantidadInt <= 0) return alert('Cantidad no válida');
    if (cantidadInt > disponible) return alert('No hay suficiente cantidad disponible');

    if (productosDetalle.find(p => p.id === id)) return alert('Producto ya agregado');

    const subtotal = parseFloat(precio) * cantidadInt;
    productosDetalle.push({ id, nombre, precio, cantidad: cantidadInt, subtotal });

    const producto = productosDisponibles.find(p => p.id_producto === id);
    if (producto) producto.CantidadDisponible -= cantidadInt;

    renderizarProductos();
    renderizarDetalleVenta();
    actualizarMontoTotal();
}

// Quitar producto
function quitarProducto(index) {
    const producto = productosDetalle[index];
    const productoDisponible = productosDisponibles.find(p => p.id_producto === producto.id);
    if (productoDisponible) productoDisponible.CantidadDisponible += producto.cantidad;

    productosDetalle.splice(index, 1);
    renderizarProductos();
    renderizarDetalleVenta();
    actualizarMontoTotal();
}

// Renderizar tabla de detalle
function renderizarDetalleVenta() {
    detalleVenta.innerHTML = '';
    productosDetalle.forEach((p, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.nombre}</td>
            <td>${parseFloat(p.precio).toFixed(2)}</td>
            <td>${p.cantidad}</td>
            <td>${parseFloat(p.subtotal).toFixed(2)}</td>
            <td><button onclick="quitarProducto(${index})">❌</button></td>
        `;
        detalleVenta.appendChild(tr);
    });
}

// Función para actualizar el monto total
function actualizarMontoTotal() {
    const total = productosDetalle.reduce((sum, p) => sum + p.subtotal, 0);
    inputMontoTotal.value = total.toFixed(2);
    const descuento = parseFloat(inputDescuento.value) || 0;
}

// Guardar venta y detalle (en batch)
async function guardarVenta() {
    if (!selectCliente.value) return alert('Seleccione un cliente');
    if (!inputFechaVenta.value) return alert('Seleccione una fecha');
    if (!metodoPago.value) return alert('Seleccione un método de pago');
    if (productosDetalle.length === 0) return alert('Agregue al menos un producto');

    const headers = getAuthHeaders();
    if (!headers) return;

    const ventaData = {
        numero_venta: inputNumeroVenta.value,
        cliente: parseInt(selectCliente.value),
        fecha_venta: inputFechaVenta.value,
        metodo_pago: metodoPago.value,
        monto_total: parseFloat(inputMontoTotal.value)
    };

    try {
        const resVenta = await fetch(API_VENTAS, {
            method: 'POST',
            headers,
            body: JSON.stringify(ventaData)
        });
        if (!resVenta.ok) throw new Error('Error guardando la venta');
        const ventaCreada = await resVenta.json();

        const detallesParaEnviar = productosDetalle.map(p => ({
            venta: ventaCreada.id_venta,
            producto: p.id,
            descripcion: p.nombre,
            precio_producto: p.precio,
            cantidad_producto: p.cantidad
        }));

        const resDetalle = await fetch(API_DETALLE_VENTA, {
            method: 'POST',
            headers,
            body: JSON.stringify(detallesParaEnviar)
        });
        if (!resDetalle.ok) throw new Error('Error guardando detalles de venta');

        alert('Venta y detalles registrados correctamente');
        cargarProductos();
        obtenerSiguienteNumeroVenta();
        limpiarFormulario();
    } catch (error) {
        console.error('Error en el proceso de venta:', error);
        alert('Hubo un problema al finalizar la venta: ' + error.message);
    }
}

document.getElementById('busqueda').addEventListener('input', function () {
    const termino = this.value.toLowerCase();
    const productosFiltrados = productosDisponibles.filter(producto =>
        producto.nombre.toLowerCase().includes(termino)
    );
    renderizarProductosFiltrados(productosFiltrados);
});

function renderizarProductosFiltrados(lista) {
    tablaProductos.innerHTML = '';
    lista.forEach(producto => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${producto.nombre}</td>
            <td>${parseFloat(producto.precioVenta).toFixed(2)}</td>
            <td>${producto.CantidadDisponible}</td>
            <td><button onclick="agregarProducto(${producto.id_producto}, '${producto.nombre}', ${producto.precioVenta}, ${producto.CantidadDisponible})">➕</button></td>
        `;
        tablaProductos.appendChild(tr);
    });
}

// Limpiar
function limpiarFormulario() {
    productosDetalle = [];
    inputDescuento.value = '';
    inputMontoTotal.value = '';
    inputNumeroVenta.value = parseInt(inputNumeroVenta.value) + 1;
    cargarProductos();
    renderizarDetalleVenta();
}

// Inicializar
function init() {
    cargarClientes();
    cargarProductos();
    obtenerSiguienteNumeroVenta();
    btnFinalizar.addEventListener('click', guardarVenta);
};

window.init = init;