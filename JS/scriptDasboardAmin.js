document.addEventListener("DOMContentLoaded", () => {
  // Selección de elementos relevantes
  const menuItemsWithSubmenu = document.querySelectorAll(
    "#menu-toggle li.has-submenu > a.submenu-toggle"
  );
  const clearSearchBtn = document.getElementById("clearSearch");
  const searchInput = document.getElementById("searchInput");
  const btnMenuToggle = document.getElementById("btn-menu-toggle");
  const menuToggle = document.getElementById("menu-toggle");
  const navProfile = document.querySelector(".nav__profile");
  const navProfileSubmenu = document.querySelector(".nav__profile__submenu");

  // === 1. Manejo de submenús en el menú lateral (solo uno abierto a la vez) ===
  menuItemsWithSubmenu.forEach((menuLink) => {
    // Click para abrir/cerrar submenu
    menuLink.addEventListener("click", (e) => {
      e.preventDefault();
      const parentLi = menuLink.parentElement;

      // Cerrar otros submenús abiertos (excepto el actual)
      document.querySelectorAll("#menu-toggle li.has-submenu.open").forEach((li) => {
        if (li !== parentLi) {
          li.classList.remove("open");
          li.querySelector("a.submenu-toggle").setAttribute("aria-expanded", "false");
          // Opcional: poner tabindex -1 para que no sean accesibles con tab
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

    // Permitir abrir submenu con teclado (Enter y Space)
    menuLink.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        menuLink.click();
      }
    });
  });

  // === 2. Botón para limpiar el campo de búsqueda y enfocar ===
  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      searchInput.focus();
    });

    // Soporte para teclado en ícono limpiar (Enter y Space)
    clearSearchBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        clearSearchBtn.click();
      }
    });
  }


  // === 4. Toggle del menú de perfil de usuario ===
  if (navProfile && navProfileSubmenu) {
    navProfile.addEventListener("click", () => {
      const isOpen = navProfile.classList.toggle("open");
      navProfile.setAttribute("aria-expanded", isOpen ? "true" : "false");
      // Mostrar/ocultar submenu perfil
      navProfileSubmenu.style.display = isOpen ? "block" : "none";
    });

    // Cerrar menú perfil al perder foco (focusout)
    navProfile.addEventListener("focusout", () => {
      // Timeout para esperar si el foco está dentro del submenu
      setTimeout(() => {
        if (!navProfile.contains(document.activeElement)) {
          navProfile.classList.remove("open");
          navProfile.setAttribute("aria-expanded", "false");
          navProfileSubmenu.style.display = "none";
        }
      }, 100);
    });
  }

  
});


document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll('[data-page]');
  const mainContent = document.getElementById('main-content');
  let currentScript = null;  // para eliminar scripts anteriores si quieres

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

            // Si había un script previo, lo quitamos para evitar duplicados
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
                // Suponemos que cada script tiene una función init() para inicializar el contenido cargado
                if (typeof init === "function") {
                  init();
                }
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
      'report.html':           'JS/report.js'
    };
    return mapa[page] || null;
  }
});



document.addEventListener('DOMContentLoaded', () => {
  const btnToggle = document.getElementById('btn-menu-toggle');
  const menu = document.getElementById('menu-toggle');
  const content = document.getElementById('content');

  btnToggle.addEventListener('click', () => {
    menu.classList.toggle('open');
    content.classList.toggle('shifted');
  });
});