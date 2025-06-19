// Obtiene las ventas agrupadas por mes (último año)
async function fetchVentasPorMes() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/ventas/reporte-ventas-mensual/');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.reporte || [];
  } catch (error) {
    console.error('Error al obtener ventas por mes:', error);
    return [];
  }
}

// Obtiene los top 10 clientes con más ventas
async function fetchTopClientes() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/ventas/reporte-top-clientes/');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.reporte || [];
  } catch (error) {
    console.error('Error al obtener top clientes:', error);
    return [];
  }
}

// Obtiene los top 10 productos más vendidos
async function fetchProductosMasVendidos() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/detalleVenta/top-productos/');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.reporte || [];
  } catch (error) {
    console.error('Error al obtener productos más vendidos:', error);
    return [];
  }
}

const clientesMap = {};

// Carga todos los clientes desde la API y crea un mapa por ID
async function cargarClientes() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/Cliente/');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Mapear clientes por ID
    data.forEach(cliente => {
      clientesMap[cliente.id] = cliente;
    });

    console.log("Clientes cargados:", clientesMap); // útil para depuración

  } catch (error) {
    console.error('Error al cargar clientes:', error);
  }
}

// Obtiene las ventas por método de pago desde la API
async function fetchVentasPorMetodoPago(metodo) {
  try {
    const url = new URL('http://127.0.0.1:8000/api/ventas/buscar-por-metodo-pago');
    url.searchParams.append('metodo', metodo);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.resultado || [];
  } catch (error) {
    console.error('Error al buscar ventas por método de pago:', error);
    return [];
  }
}

// Muestra la tabla de ventas
function mostrarVentasTabla(ventas) {
  const tbody = document.getElementById('ventasMetodoTableBody');
  tbody.innerHTML = '';

  if (!ventas.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center">No se encontraron ventas.</td></tr>`;
    return;
  }

  ventas.forEach(venta => {
    const cliente = clientesMap[venta.cliente]; // usa el ID para buscar en el mapa

    let nombreCliente = 'N/A';
    if (cliente) {
      nombreCliente = `${cliente.codigo} - ${cliente.nombres} ${cliente.apellidos}`;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${venta.numero_venta ?? 'N/A'}</td>
      <td>${nombreCliente}</td>
      <td>${venta.monto_total ?? '0'}</td>
      <td>${venta.metodo_pago ?? 'N/A'}</td>
      <td>${venta.fecha_venta ? new Date(venta.fecha_venta).toLocaleDateString() : 'N/A'}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Controlador principal
async function mostrarVentasMetodoPago(metodo) {
  await cargarClientes(); // Carga los clientes primero
  const ventas = await fetchVentasPorMetodoPago(metodo);
  mostrarVentasTabla(ventas);
}


// Configura los eventos, por ejemplo, botón para filtrar ventas por método de pago
function setupEventListeners() {
  const btnBuscar = document.getElementById('btnBuscarMetodo');
  if (!btnBuscar) return;

  btnBuscar.addEventListener('click', () => {
    const metodo = document.getElementById('selectMetodoPago').value;
    if (!metodo) {
      alert('Por favor, selecciona un método de pago.');
      return;
    }
    mostrarVentasMetodoPago(metodo);
  });
}

// Inicializa todos los gráficos y carga los datos
async function initCharts() {
  const ventasMes = await fetchVentasPorMes();               // Datos ventas por mes
  const topClientes = await fetchTopClientes();              // Datos top clientes
  const productosMasVendidos = await fetchProductosMasVendidos(); // Datos top productos

  // --- Gráfico Ventas por Mes (barras verticales) ---
  const ctxMes = document.getElementById('ventasPorMes');
  if (ctxMes) {
    new Chart(ctxMes.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ventasMes.map(v => v.nombre_mes),
        datasets: [{
          label: 'Monto Total ($)',
          data: ventasMes.map(v => v.total),
          backgroundColor: 'rgba(13, 110, 253, 0.7)',
          borderColor: 'rgba(13, 110, 253, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.parsed.y.toLocaleString()}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => `${value.toLocaleString()}`
            }
          }
        }
      }
    });
  }

  // --- Gráfico Top 10 Clientes (pie con destaque en mayor) ---
  const ctxClientes = document.getElementById('topClientes');
  if (ctxClientes) {
    const dataClientes = topClientes.map(c => c.total_ventas ?? 0);
    const maxVentas = Math.max(...dataClientes);
    const maxIndex = dataClientes.indexOf(maxVentas);
    const offsets = dataClientes.map((_, i) => (i === maxIndex ? 10 : 0));

    new Chart(ctxClientes.getContext('2d'), {
      type: 'pie',
      data: {
        labels: topClientes.map(c => c.cliente_concat || 'Cliente'),
        datasets: [{
          data: dataClientes,
          backgroundColor: [
            '#0d6efd', '#6f42c1', '#198754', '#ffc107', '#fd7e14',
            '#20c997', '#6610f2', '#dc3545', '#0dcaf0', '#adb5bd'
          ],
          borderColor: '#fff',
          borderWidth: 7,
          offset: offsets
        }]
      },
      options: {
        responsive: true,
        aspectRatio: 1,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 12 }, color: '#333' }
          },
          tooltip: {
            callbacks: {
              label(ctx) {
                const val = ctx.parsed;
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = ((val / total) * 100).toFixed(1);
                return `${ctx.label}: ${val} venta(s) (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  // --- Gráfico Top 10 Productos Más Vendidos (barras horizontales) ---
  const ctxProductos = document.getElementById('top');
  if (ctxProductos) {
    new Chart(ctxProductos.getContext('2d'), {
      type: 'bar',
      data: {
        labels: productosMasVendidos.map(p => p['producto__nombre'] || 'Producto'),
        datasets: [{
          label: 'Cantidad Vendida',
          data: productosMasVendidos.map(p => p.cantidad_vendida ?? 0),
          backgroundColor: 'rgba(0,182,100, 0.7)',
          borderColor: 'rgb(0, 182, 70)',
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',  // Barras horizontales
        responsive: true,
        scales: {
          x: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.parsed.x} unidades`
            }
          }
        }
      }
    });
  }
}

// Función principal que configura eventos y carga gráficos al cargar DOM
async function init() {
  setupEventListeners();
  await initCharts();
}

// Espera que el documento esté listo para inicializar todo
document.addEventListener('DOMContentLoaded', init);
