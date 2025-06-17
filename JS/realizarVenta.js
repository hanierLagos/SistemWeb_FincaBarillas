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

// Cargar productos desde la API
function cargarProductos() {
  fetch(API_PRODUCTOS)
    .then(res => res.json())
    .then(data => {
      productosDisponibles = data.filter(p => p.estado === 'Activo');
      renderizarProductos();
    });
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
function cargarClientes() {
  fetch(API_CLIENTES)
    .then(res => res.json())
    .then(data => {
      selectCliente.innerHTML = '<option value="">Seleccione un cliente</option>';
      data.forEach(cliente => {
        const opt = document.createElement('option');
        opt.value = cliente.id;
        opt.textContent = `${cliente.nombres} ${cliente.apellidos} (${cliente.codigo})`;
        selectCliente.appendChild(opt);
      });
    });
}

// Obtener número de venta
function obtenerSiguienteNumeroVenta() {
  fetch(API_VENTAS)
    .then(res => res.json())
    .then(data => {
      const ultimoNumero = data.reduce((max, v) => {
        const num = parseInt(v.numero_venta);
        return num > max ? num : max;
      }, 0);
      inputNumeroVenta.value = ultimoNumero + 1;
    })
    .catch(() => {
      inputNumeroVenta.value = 1;
    });
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

  // Restar cantidad disponible localmente
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
  // Sumar todos los subtotales de productos agregados
  const total = productosDetalle.reduce((sum, p) => sum + p.subtotal, 0);
  // Actualizar el campo monto total
  inputMontoTotal.value = total.toFixed(2);
  // Tomar descuento actual (si es un número válido)
  const descuento = parseFloat(inputDescuento.value) || 0;
  //MO LLVO DESCUENTO 

}
// Guardar venta y detalle (en batch)
function guardarVenta() {
  if (!selectCliente.value) return alert('Seleccione un cliente');
  if (!inputFechaVenta.value) return alert('Seleccione una fecha');
  if (!metodoPago.value) return alert('Seleccione un método de pago');
  if (productosDetalle.length === 0) return alert('Agregue al menos un producto');

  const ventaData = {
    numero_venta: inputNumeroVenta.value,
    cliente: parseInt(selectCliente.value),
    fecha_venta: inputFechaVenta.value,
    metodo_pago: metodoPago.value,
    monto_total: parseFloat(inputMontoTotal.value)
  };

  fetch(API_VENTAS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ventaData)
  })
    .then(res => {
      if (!res.ok) throw new Error('Error guardando la venta');
      return res.json();
    })
    .then(ventaCreada => {
      // Preparamos array para enviar todos los detalles juntos
      const detallesParaEnviar = productosDetalle.map(p => ({
        venta: ventaCreada.id_venta,
        producto: p.id,
        descripcion: p.nombre,
        precio_producto: p.precio,
        cantidad_producto: p.cantidad
        // sub_total no es necesario enviarlo, se calcula en backend
      }));

      return fetch(API_DETALLE_VENTA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(detallesParaEnviar)
      });
    })
    .then(res => {
      if (!res.ok) throw new Error('Error guardando detalles de venta');
      return res.json();
    })
    .then(() => {
      alert('Venta y detalles registrados correctamente');
 
      // Volver a cargar productos
      cargarProductos();
      // Volver a obtener el siguiente número de venta
      obtenerSiguienteNumeroVenta();
      // Limpiar el formulario
      limpiarFormulario();


    })
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
function init (){
  cargarClientes();
  cargarProductos();
  obtenerSiguienteNumeroVenta();
  btnFinalizar.addEventListener('click', guardarVenta);

};

window.init = init;