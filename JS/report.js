async function fetchVentasPorMes() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/ventas/reporte-ventas-mensual/');
<<<<<<< HEAD
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
=======
    if (!res.ok) throw new Error(HTTP ${res.status});
>>>>>>> 653e3b069a7181ccb840aede4ca097c2e2dcaf78
    const json = await res.json();
    console.log('Ventas por mes:', json.reporte); // <- LOG
    return json.reporte || [];
  } catch (error) {
    console.error('Error al obtener ventas por mes:', error);
    return [];
  }

}


async function fetchTopClientes() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/ventas/reporte-top-clientes/');
<<<<<<< HEAD
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
=======
    if (!res.ok) throw new Error(HTTP ${res.status});
>>>>>>> 653e3b069a7181ccb840aede4ca097c2e2dcaf78
    const json = await res.json();
    console.log('Top clientes:', json.reporte); // <- LOG
    return json.reporte || [];
  } catch (error) {
    console.error('Error al obtener top clientes:', error);
    return [];
  }
}

async function initCharts() {
  console.log("¿Chart está definido?", typeof Chart); 
  const ventasMes = await fetchVentasPorMes();
  const topClientes = await fetchTopClientes();

  // --- Ventas por Mes ---
  const ctxMes = document.getElementById('ventasPorMes').getContext('2d');
  const labelsMes = ventasMes.map(v => v.nombre_mes);
  const dataMes = ventasMes.map(v => v.total);

  new Chart(ctxMes, {
    type: 'bar',
    data: {
      labels: labelsMes,
      datasets: [{
        label: 'Monto Total ($)',
        data: dataMes,
        backgroundColor: 'rgba(13, 110, 253, 0.7)',
        borderColor: 'rgba(13, 110, 253, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: {
<<<<<<< HEAD
          label: ctx => `$${ctx.parsed.y.toLocaleString()}`
=======
          label: ctx => $${ctx.parsed.y.toLocaleString()}
>>>>>>> 653e3b069a7181ccb840aede4ca097c2e2dcaf78
        }}
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
<<<<<<< HEAD
            callback: value => `$${value.toLocaleString()}`
=======
            callback: value => $${value.toLocaleString()}
>>>>>>> 653e3b069a7181ccb840aede4ca097c2e2dcaf78
          }
        }
      }
    }
  });

  // --- Top 10 Clientes (Gráfico de pastel con destaque) ---
  const ctxClientes = document.getElementById('topClientes').getContext('2d');
  const labelsClientes = topClientes.map(c => c.cliente_concat);
  const dataClientes = topClientes.map(c => c.total_ventas);

  // Encontrar índice del cliente con más ventas
  const maxVentas = Math.max(...dataClientes);
  const maxIndex = dataClientes.indexOf(maxVentas);

  // Definir offsets: solo la porción mayor tendrá separación
  const offsets = dataClientes.map((_, i) => i === maxIndex ? 20 : 0);

  new Chart(ctxClientes, {
    type: 'pie',
    data: {
      labels: labelsClientes,
      datasets: [{
        data: dataClientes,
        backgroundColor: [
          '#0d6efd', '#6f42c1', '#198754', '#ffc107', '#fd7e14',
          '#20c997', '#6610f2', '#dc3545', '#0dcaf0', '#adb5bd'
        ],
        borderColor: '#fff',
        borderWidth: 2,
        // offset en píxeles: separa la rebanada más grande
        offset: offsets
      }]
    },
    options: {
      responsive: true,
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
<<<<<<< HEAD
              return `${ctx.label}: ${val} venta(s) (${pct}%)`;
=======
              return ${ctx.label}: ${val} venta(s) (${pct}%);
>>>>>>> 653e3b069a7181ccb840aede4ca097c2e2dcaf78
            }
          }
        }
      }
    }
  });


}

async function fetchVentasPorMetodoPago(metodo) {
  try {
    const url = new URL('http://127.0.0.1:8000/api/ventas/buscar-por-metodo-pago');
    url.searchParams.append('metodo', metodo);

    const res = await fetch(url);
<<<<<<< HEAD
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
=======
    if (!res.ok) throw new Error(Error HTTP ${res.status});
>>>>>>> 653e3b069a7181ccb840aede4ca097c2e2dcaf78
    const data = await res.json();
    return data.resultado || [];
  } catch (error) {
    console.error('Error al buscar ventas por método de pago:', error);
    return [];
  }
}

function mostrarVentasTabla(ventas) {
  const tbody = document.getElementById('ventasMetodoTableBody');
  tbody.innerHTML = '';

  if (!ventas.length) {
<<<<<<< HEAD
    tbody.innerHTML = `<tr><td colspan="5" class="text-center">No se encontraron ventas.</td></tr>`;
=======
    tbody.innerHTML = <tr><td colspan="5" class="text-center">No se encontraron ventas.</td></tr>;
>>>>>>> 653e3b069a7181ccb840aede4ca097c2e2dcaf78
    return;
  }

  ventas.forEach(venta => {
    let nombreCliente = 'N/A';
    if (venta.cliente) {
      if (typeof venta.cliente === 'string') {
        nombreCliente = venta.cliente;
      } else if (venta.cliente.codigo && venta.cliente.nombres && venta.cliente.apellidos) {
        nombreCliente = venta.cliente.codigo + ' - ' + venta.cliente.nombres + ' ' + venta.cliente.apellidos;
      } else if (venta.cliente.nombre_completo) {
        nombreCliente = venta.cliente.nombre_completo;
      }
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${venta.id_venta || venta.id}</td>
      <td>${nombreCliente}</td>
      <td>${venta.monto_total}</td>
      <td>${venta.metodo_pago}</td>
      <td>${new Date(venta.fecha_venta).toLocaleDateString()}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function mostrarVentasMetodoPago(metodo) {
  const ventas = await fetchVentasPorMetodoPago(metodo);
  mostrarVentasTabla(ventas);
}

// async function initCharts() {
//   // Ventas por Mes
//   const ventasMes = await fetchVentasPorMes();
//   const labelsMes = ventasMes.map(item => item.nombre_mes);
//   const dataMes = ventasMes.map(item => item.total);

//   new Chart(document.getElementById('ventasPorMes'), {
//     type: 'bar',
//     data: {
//       labels: labelsMes,
//       datasets: [{
//         label: 'Ventas',
//         data: dataMes,
//         backgroundColor: 'rgba(13, 110, 253, 0.7)',
//         borderColor: 'rgba(13, 110, 253, 1)',
//         borderWidth: 1,
//       }]
//     },
//     options: {
//       scales: {
//         y: { beginAtZero: true }
//       }
//     }
//   });

//   // Ventas por Método de Pago
//   const ventasMetodo = await fetchVentasPorMetodo();
//   const labelsMetodo = ventasMetodo.map(item => item.metodo_pago);
//   const dataMetodo = ventasMetodo.map(item => item.total_ventas);

//   new Chart(document.getElementById('ventasPorMetodo'), {
//     type: 'pie',
//     data: {
//       labels: labelsMetodo,
//       datasets: [{
//         label: 'Ventas',
//         data: dataMetodo,
//         backgroundColor: [
//           '#0d6efd', '#198754', '#ffc107', '#dc3545', '#6c757d'
//         ],
//         borderWidth: 1,
//       }]
//     }
//   });

//   // Top 10 Clientes
//   const topClientes = await fetchTopClientes();
//   const labelsClientes = topClientes.map(item => item.cliente_concat);
//   const dataClientes = topClientes.map(item => item.total_ventas);

//   new Chart(document.getElementById('topClientes'), {
//     type: 'bar',
//     data: {
//       labels: labelsClientes,
//       datasets: [{
//         label: 'Cantidad de Ventas',
//         data: dataClientes,
//         backgroundColor: 'rgba(25, 135, 84, 0.7)',
//         borderColor: 'rgba(25, 135, 84, 1)',
//         borderWidth: 1,
//       }]
//     },
//     options: {
//       indexAxis: 'y',
//       scales: { x: { beginAtZero: true } }
//     }
//   });
// }

function setupEventListeners() {
  document.getElementById('btnBuscarMetodo').addEventListener('click', () => {
    const metodo = document.getElementById('selectMetodoPago').value;
    if (!metodo) {
      alert('Por favor, selecciona un método de pago.');
      return;
    }
    mostrarVentasMetodoPago(metodo);
  });
}

// Función principal de inicialización
async function init() {
  setupEventListeners();
  await initCharts();
}


// Esperar que el DOM esté listo para iniciar
<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', init);

=======
document.addEventListener('DOMContentLoaded', init);
>>>>>>> 653e3b069a7181ccb840aede4ca097c2e2dcaf78
