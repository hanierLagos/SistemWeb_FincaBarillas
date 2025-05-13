// Datos simulados
const ventasMensuales = [1000, 1500, 1300, 1100, 900, 1250, 1400, 1600, 1700, 1800, 2100, 2300];
const productosVendidosMensuales = [50, 65, 55, 40, 35, 60, 70, 75, 80, 85, 90, 95];
const pedidosMensuales = [30, 45, 40, 35, 25, 50, 55, 65, 60, 70, 80, 85];

const clientes = [
  { nombre: "Juan Pérez", compras: 300 },
  { nombre: "Ana López", compras: 1200 },
  { nombre: "Carlos Díaz", compras: 100 }
];

const productos = [
  { nombre: "Platano", vendidos: 10000 },
  { nombre: "Malanga", vendidos: 4000 },
  { nombre: "Papaya", vendidos: 900 }
];

// Totales
const totalVentas = ventasMensuales.reduce((a, b) => a + b, 0);
const totalProductosVendidos = productosVendidosMensuales.reduce((a, b) => a + b, 0);
const totalPedidos = pedidosMensuales.reduce((a, b) => a + b, 0);
const totalClientes = clientes.length;

// Mostrar en tarjetas
document.getElementById("totalVentas").textContent = `$${totalVentas.toLocaleString()}.00`;
document.getElementById("totalProductos").textContent = totalProductosVendidos;
document.getElementById("totalPedidos").textContent = totalPedidos;
document.getElementById("totalClientes").textContent = totalClientes;

// Mostrar en datos relevantes
document.getElementById("relevantVentas").textContent = `$${totalVentas.toLocaleString()}.00`;
document.getElementById("relevantPedidos").textContent = totalPedidos;
document.getElementById("relevantClientes").textContent = totalClientes;
document.getElementById("relevantProductos").textContent = totalProductosVendidos;

// Gráfico de ventas mensuales
new Chart(document.getElementById("ventasChart"), {
  type: 'line',
  data: {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    datasets: [{
      label: 'Ventas Mensuales',
      data: ventasMensuales,
      borderColor: '#00ff88',
      backgroundColor: 'rgba(0,255,136,0.2)',
      tension: 0.3,
      fill: true
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
});

// Gráfico de clientes más frecuentes
new Chart(document.getElementById("graficoClientes"), {
  type: 'doughnut',
  data: {
    labels: clientes.map(c => c.nombre),
    datasets: [{
      data: clientes.map(c => c.compras),
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
});

// Gráfico de productos más vendidos
new Chart(document.getElementById("topProductsChart"), {
  type: 'bar',
  data: {
    labels: productos.map(p => p.nombre),
    datasets: [{
      label: 'Vendidos',
      data: productos.map(p => p.vendidos),
      backgroundColor: ['#42f57b', '#42d4f5', '#f5a742']
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

