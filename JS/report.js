function loadReport() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = ''; // limpiar contenido previo

  // Crear contenedor principal
  const reportContainer = document.createElement('div');
  reportContainer.id = 'report-content';

  // --- Crear tarjetas de resumen ---
  const cardsHTML = `
    <div style="display:flex; gap:20px; margin-bottom:20px;">
      <div style="flex:1; padding:15px; background:#e8f5e9; border-radius:8px; text-align:center;">
        <h3>Total Ventas</h3>
        <p id="totalVentas" style="font-size:24px; font-weight:bold;"></p>
      </div>
      <div style="flex:1; padding:15px; background:#e3f2fd; border-radius:8px; text-align:center;">
        <h3>Total Productos Vendidos</h3>
        <p id="totalProductos" style="font-size:24px; font-weight:bold;"></p>
      </div>
      <div style="flex:1; padding:15px; background:#fff3e0; border-radius:8px; text-align:center;">
        <h3>Total Pedidos</h3>
        <p id="totalPedidos" style="font-size:24px; font-weight:bold;"></p>
      </div>
      <div style="flex:1; padding:15px; background:#fce4ec; border-radius:8px; text-align:center;">
        <h3>Total Clientes</h3>
        <p id="totalClientes" style="font-size:24px; font-weight:bold;"></p>
      </div>
    </div>
  `;
  reportContainer.innerHTML = cardsHTML;

  // --- Crear contenedores para gráficos ---
  const chartsHTML = `
    <div style="display:flex; gap:20px; margin-bottom:20px;">
      <canvas id="ventasChart" width="400" height="200" style="background:#fff; border-radius:8px; padding:10px;"></canvas>
      <canvas id="graficoClientes" width="400" height="200" style="background:#fff; border-radius:8px; padding:10px;"></canvas>
      <canvas id="topProductsChart" width="400" height="200" style="background:#fff; border-radius:8px; padding:10px;"></canvas>
    </div>
  `;
  reportContainer.innerHTML += chartsHTML;

  // --- Crear botones de exportación ---
  const buttonsHTML = `
    <div style="margin-bottom: 30px;">
      <button id="exportPDF" style="margin-right:10px; padding:10px 20px; cursor:pointer;">Exportar a PDF</button>
      <button id="exportExcel" style="padding:10px 20px; cursor:pointer;">Exportar a Excel</button>
    </div>
  `;
  reportContainer.innerHTML += buttonsHTML;

  mainContent.appendChild(reportContainer);

  // --- Datos simulados ---
  const ventasMensuales = [1000, 1500, 1300, 1100, 900, 1250, 1400, 1600, 1700, 1800, 2100, 2300];
  const productosVendidosMensuales = [50, 65, 55, 40, 35, 60, 70, 75, 80, 85, 90, 95];
  const pedidosMensuales = [30, 45, 40, 35, 25, 50, 55, 65, 60, 70, 80, 85];

  const clientes = [
    { nombre: "Juan Pérez", compras: 300 },
    { nombre: "Ana López", compras: 1200 },
    { nombre: "Carlos Díaz", compras: 100 }
  ];

  const productos = [
    { nombre: "Plátano", vendidos: 10000 },
    { nombre: "Malanga", vendidos: 4000 },
    { nombre: "Papaya", vendidos: 900 }
  ];

  // Totales
  const totalVentas = ventasMensuales.reduce((a, b) => a + b, 0);
  const totalProductos = productosVendidosMensuales.reduce((a, b) => a + b, 0);
  const totalPedidos = pedidosMensuales.reduce((a, b) => a + b, 0);
  const totalClientes = clientes.length;

  // Mostrar totales en tarjetas
  document.getElementById("totalVentas").textContent = `$${totalVentas.toLocaleString()}.00`;
  document.getElementById("totalProductos").textContent = totalProductos;
  document.getElementById("totalPedidos").textContent = totalPedidos;
  document.getElementById("totalClientes").textContent = totalClientes;

  // --- Crear gráficos ---
  // Nota: Chart.js debe estar cargado en el HTML para que esto funcione
  new Chart(document.getElementById("ventasChart"), {
    type: 'line',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [{
        label: "Ventas Mensuales",
        data: ventasMensuales,
        backgroundColor: 'rgba(67, 160, 71, 0.2)',
        borderColor: 'rgba(67, 160, 71, 1)',
        borderWidth: 2,
        fill: true
      }]
    }
  });

  new Chart(document.getElementById("graficoClientes"), {
    type: 'bar',
    data: {
      labels: clientes.map(c => c.nombre),
      datasets: [{
        label: 'Compras',
        data: clientes.map(c => c.compras),
        backgroundColor: '#43a047'
      }]
    }
  });

  new Chart(document.getElementById("topProductsChart"), {
    type: 'doughnut',
    data: {
      labels: productos.map(p => p.nombre),
      datasets: [{
        label: 'Productos Vendidos',
        data: productos.map(p => p.vendidos),
        backgroundColor: ['#43a047', '#66bb6a', '#a5d6a7']
      }]
    }
  });

  // --- Exportar a PDF ---
  document.getElementById("exportPDF").addEventListener("click", () => {
    const content = document.getElementById("report-content");
    // html2pdf debe estar cargado en el HTML
    html2pdf().from(content).save("reporte.pdf");
  });

  // --- Exportar a Excel ---
  document.getElementById("exportExcel").addEventListener("click", () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([
      { Ventas: totalVentas, Pedidos: totalPedidos, Clientes: totalClientes, Productos: totalProductos }
    ]);
    XLSX.utils.book_append_sheet(wb, ws, "Resumen");
    XLSX.writeFile(wb, "reporte.xlsx");
  });
}
