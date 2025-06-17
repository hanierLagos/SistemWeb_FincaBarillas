document.addEventListener("DOMContentLoaded", () => {
  // 1. Manejo de submenús en el menú lateral (solo uno abierto a la vez)
  const menuItemsWithSubmenu = document.querySelectorAll(
    "#menu-toggle li.has-submenu > a.submenu-toggle"
  );
  const clearSearchBtn = document.getElementById("clearSearch");
  const searchInput = document.getElementById("searchInput");
  const navProfile = document.querySelector(".nav__profile");
  const navProfileSubmenu = document.querySelector(".nav_profile_submenu");

  // Inicializar submenús cerrados al cargar la página
  menuItemsWithSubmenu.forEach(menuLink => {
    const parentLi = menuLink.parentElement;
    const submenu = parentLi.querySelector(".menu-toggle__submenu");
    if (submenu) {
      submenu.style.display = "none"; // ocultar submenú
      submenu.querySelectorAll("a").forEach(a => a.setAttribute("tabindex", "-1")); // inhabilitar tabulación
    }
    menuLink.setAttribute("aria-expanded", "false");
    parentLi.classList.remove("open");
  });

  menuItemsWithSubmenu.forEach((menuLink) => {
    menuLink.addEventListener("click", (e) => {
      e.preventDefault();
      const parentLi = menuLink.parentElement;

      // Cerrar otros submenús abiertos excepto el actual
      document.querySelectorAll("#menu-toggle li.has-submenu.open").forEach((li) => {
        if (li !== parentLi) {
          li.classList.remove("open");
          const submenuToggle = li.querySelector("a.submenu-toggle");
          if (submenuToggle) submenuToggle.setAttribute("aria-expanded", "false");
          const submenu = li.querySelector(".menu-toggle__submenu");
          if (submenu) {
            submenu.style.display = "none";
            submenu.querySelectorAll("a").forEach(a => a.setAttribute("tabindex", "-1"));
          }
        }
      });

      // Abrir o cerrar el submenu actual
      const submenu = parentLi.querySelector(".menu-toggle__submenu");
      const isOpen = parentLi.classList.toggle("open");
      menuLink.setAttribute("aria-expanded", isOpen ? "true" : "false");

      if (submenu) {
        submenu.style.display = isOpen ? "block" : "none";
        submenu.querySelectorAll("a").forEach(a => a.setAttribute("tabindex", isOpen ? "0" : "-1"));
      }
    });

    // Permitir abrir submenu con teclado (Enter y Space)
    menuLink.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        menuLink.click();
      }
    });
  });

  // 2. Botón para limpiar el campo de búsqueda y enfocar
  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      searchInput.focus();
    });

    clearSearchBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        clearSearchBtn.click();
      }
    });
  }

  // 3. Toggle del menú de perfil de usuario
  if (navProfile && navProfileSubmenu) {
    navProfile.addEventListener("click", () => {
      const isOpen = navProfile.classList.toggle("open");
      navProfile.setAttribute("aria-expanded", isOpen ? "true" : "false");
      navProfileSubmenu.style.display = isOpen ? "block" : "none";
    });

    navProfile.addEventListener("focusout", () => {
      setTimeout(() => {
        if (!navProfile.contains(document.activeElement)) {
          navProfile.classList.remove("open");
          navProfile.setAttribute("aria-expanded", "false");
          navProfileSubmenu.style.display = "none";
        }
      }, 100);
    });
  }

  // 4. Carga dinámica de contenido y scripts asociados con manejo de errores
  const links = document.querySelectorAll('[data-page]');
  const mainContent = document.getElementById('main-content');
  let currentScript = null;  // para eliminar scripts anteriores si los hay

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      const scriptName = obtenerScriptAsociado(page);

      if (page) {
        fetch(page)
          .then(response => {
            if (!response.ok) throw new Error('Error al cargar la página: ' + page);
            return response.text();
          })
          .then(html => {
            mainContent.innerHTML = html;
            window.scrollTo(0, 0);

            // Remover script previo si existe
            if (currentScript) {
              currentScript.remove();
              currentScript = null;
            }

            if (scriptName) {
              const script = document.createElement('script');
              script.src = scriptName;
              script.type = "text/javascript";
              script.onload = () => {
                console.log(`✅ Script cargado: ${scriptName}`);
                if (typeof init === "function") {
                  init();
                }
              };
              script.onerror = () => {
                console.error(`❌ Error al cargar el script: ${scriptName}`);
              };
              document.body.appendChild(script);
              currentScript = script;
            }
          })
          .catch(err => {
            console.error(err);
            mainContent.innerHTML = `<p>Error al cargar la página <strong>${page}</strong>.</p>`;
          });
      }
    });
  });

  function obtenerScriptAsociado(page) {
    const mapa = {
      'clientList.html':       'JS/loadCrudClient.js',
      'productList.html':      'JS/loadCrudProduct.js',
      'typeProductList.html':  'JS/loadCrudTypeProdcut.js',
      'report.html':           'JS/report.js',
      'realizarVenta.html':    'JS/realizarVenta.js',
    };
    return mapa[page] || null;
  }

  // 5. Toggle menú lateral (botón y contenido)
  const btnMenuToggle = document.getElementById('btn-menu-toggle');
  const menuToggle = document.getElementById('menu-toggle');
  const content = document.getElementById('content');

  function toggleMenu() {
    menuToggle.classList.toggle('open');
    content.classList.toggle('shifted');
  }

  if (btnMenuToggle) {
    btnMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });
  }

  if (content) {
    content.addEventListener('click', () => {
      if (menuToggle.classList.contains('open')) {
        toggleMenu();
      }
    });
  }

  // Cerrar menú con tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === "Escape" && menuToggle.classList.contains('open')) {
      toggleMenu();
    }
  });
});
