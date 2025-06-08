document.addEventListener("DOMContentLoaded", () => {
  const menuItemsWithSubmenu = document.querySelectorAll(
    "#menu-toggle li.has-submenu > a.submenu-toggle"
  );
  const clearSearchBtn = document.getElementById("clearSearch");
  const searchInput = document.getElementById("searchInput");
  const btnMenuToggle = document.getElementById("btn-menu-toggle");
  const menuToggle = document.getElementById("menu-toggle");
  const navProfile = document.querySelector(".nav__profile");
  const navProfileSubmenu = document.querySelector(".nav__profile__submenu");

  // Alternar submenús (solo uno abierto a la vez)
  menuItemsWithSubmenu.forEach((menuLink) => {
    // Click para abrir/cerrar submenu
    menuLink.addEventListener("click", (e) => {
      e.preventDefault();
      const parentLi = menuLink.parentElement;

      // Cerrar otros submenús abiertos
      document.querySelectorAll("#menu-toggle li.has-submenu.open").forEach((li) => {
        if (li !== parentLi) {
          li.classList.remove("open");
          li.querySelector("a.submenu-toggle").setAttribute("aria-expanded", "false");
          // Opcional: reset tabindex de submenu items
          li.querySelectorAll(".menu-toggle__submenu a").forEach(a => a.setAttribute("tabindex", "-1"));
        }
      });

      // Alternar submenú actual
      const isOpen = parentLi.classList.toggle("open");
      menuLink.setAttribute("aria-expanded", isOpen ? "true" : "false");

      // Ajustar tabindex de los links dentro del submenu para accesibilidad
      parentLi.querySelectorAll(".menu-toggle__submenu a").forEach(a => {
        a.setAttribute("tabindex", isOpen ? "0" : "-1");
      });
    });

    // Soporte para abrir submenu con teclado (Enter y Space)
    menuLink.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        menuLink.click();
      }
    });
  });

  // Botón para limpiar el campo de búsqueda y enfocar
  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      searchInput.focus();
    });

    // Soporte teclado en ícono limpiar
    clearSearchBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        clearSearchBtn.click();
      }
    });
  }

  // Toggle menú lateral para móvil
  if (btnMenuToggle && menuToggle) {
    btnMenuToggle.addEventListener("click", () => {
      const isCollapsed = menuToggle.classList.toggle("collapsed");
      btnMenuToggle.setAttribute("aria-expanded", !isCollapsed);
    });
  }

  // Toggle menú perfil usuario
  if (navProfile && navProfileSubmenu) {
    navProfile.addEventListener("click", () => {
      const isOpen = navProfile.classList.toggle("open");
      navProfile.setAttribute("aria-expanded", isOpen ? "true" : "false");
      navProfileSubmenu.style.display = isOpen ? "block" : "none";
    });

    // Cerrar menú perfil al perder foco
    navProfile.addEventListener("focusout", (e) => {
      // Espera un momento para evitar cerrar si el foco está dentro del submenu
      setTimeout(() => {
        if (!navProfile.contains(document.activeElement)) {
          navProfile.classList.remove("open");
          navProfile.setAttribute("aria-expanded", "false");
          navProfileSubmenu.style.display = "none";
        }
      }, 100);
    });
  }

  // Función simulada para obtener datos (reemplazar con fetch real si hace falta)
  async function fetchData() {
    try {
      // Simulación de datos
      const data = [
        { fecha: "2025-06-01", metricas: "Ventas", valor: 250 },
        { fecha: "2025-06-02", metricas: "Clientes", valor: 45 },
        { fecha: "2025-06-03", metricas: "Pedidos", valor: 100 },
      ];

      const tbody = document.getElementById("dataTable");
      if (!tbody) return;

      // Limpiar tabla antes de cargar
      tbody.innerHTML = "";

      // Insertar filas en tabla
      data.forEach((item) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${item.fecha}</td>
          <td>${item.metricas}</td>
          <td>${item.valor}</td>
        `;
        tbody.appendChild(tr);
      });
    } catch (error) {
      console.error("Error al cargar los datos:", error);
    }
  }

  // Ejecutar carga de datos al iniciar
  fetchData();
});

document.getElementById('link-clientes').addEventListener('click', function (e) {
  e.preventDefault();

  fetch('clientList.html')
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al cargar la página de clientes');
      }
      return response.text();
    })
    .then(html => {
      document.getElementById('main-content').innerHTML = html;
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('main-content').innerHTML = '<p>Error al cargar clientes.</p>';
    });
});