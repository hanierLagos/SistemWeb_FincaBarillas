function init() {
  // Referencias a elementos del DOM
  const tbody       = document.querySelector('#loadTypeProductList tbody');  // Cuerpo de la tabla
  const addBtn      = document.getElementById('addTypeProductBtn');         // Botón "Agregar Tipo de Producto"
  const modal       = document.getElementById('typeProductModal');          // Modal para agregar/editar
  const closeModal  = document.getElementById('closeModal');                // Botón cerrar modal (X)
  const form        = document.getElementById('typeProductForm');           // Formulario dentro del modal
  const title       = document.getElementById('modal-title');               // Título del modal
  const apiUrl      = 'http://127.0.0.1:8000/api/TipoProducto/';           // URL base de la API

  // Referencias a campos del formulario
  const inpCodigo       = document.getElementById('codigo');                // Campo código
  const inpDescripcion  = document.getElementById('description');           // Campo descripción

  // Variable para almacenar el ID del tipo de producto que se está editando (null si es nuevo)
  let editarId = null;

  // -------- Función para cargar los tipos de productos desde la API y mostrarlos --------
  async function cargarTipoProductos() {
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`Error al cargar tipos de productos (status: ${res.status})`);
      const data = await res.json();

      // Limpiar tabla antes de llenar
      tbody.innerHTML = '';

      // Llenar la tabla con cada tipo de producto
      data.forEach(item => {
        const tr = document.createElement('tr');

        // Celdas de id, código y descripción
        tr.appendChild(crearCeldaTexto(item.id));
        tr.appendChild(crearCeldaTexto(item.codigo));
        tr.appendChild(crearCeldaTexto(item.description));

        // Celda y botón para editar
        const tdEdit = document.createElement('td');
        const btnEdit = document.createElement('button');
        btnEdit.classList.add('btn-edit');
        btnEdit.setAttribute('aria-label', `Editar tipo de producto ${item.codigo}`);
        btnEdit.innerHTML = '<i class="bx bx-edit"></i>';
        btnEdit.addEventListener('click', () => abrirModal(item));
        tdEdit.appendChild(btnEdit);
        tr.appendChild(tdEdit);

        // Celda y botón para eliminar (deshabilitado, solo alerta)
        const tdDel = document.createElement('td');
        const btnDel = document.createElement('button');
        btnDel.classList.add('btn-delete');
        btnDel.setAttribute('aria-label', `Eliminar tipo de producto ${item.codigo}`);
        btnDel.innerHTML = '<i class="bx bx-trash"></i>';
        btnDel.addEventListener('click', () => eliminarTipoProducto(item.id));
        tdDel.appendChild(btnDel);
        tr.appendChild(tdDel);

        tbody.appendChild(tr);
      });
    } catch (error) {
      console.error('Error al cargar los tipos de productos:', error);
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">
                          Error al cargar los tipos de productos.
                         </td></tr>`;
    }
  }

  // Función auxiliar para crear una celda <td> con texto
  function crearCeldaTexto(texto) {
    const td = document.createElement('td');
    td.textContent = texto;
    return td;
  }

  // -------- Función para abrir el modal, ya sea para agregar o editar --------
  function abrirModal(typeProduct = null) {
    editarId = typeProduct ? typeProduct.id : null;
    title.textContent = typeProduct ? 'Editar Tipo de Producto' : 'Agregar Tipo de Producto';

    inpCodigo.value      = typeProduct?.codigo || '';
    inpDescripcion.value = typeProduct?.description || '';

    modal.style.display = 'flex';

    // Poner foco en el primer campo para mejor usabilidad
    inpCodigo.focus();
  }

  // -------- Función para cerrar el modal y limpiar el formulario --------
  function cerrarModal() {
    modal.style.display = 'none';
    form.reset();
    editarId = null;
  }

  // Eventos para cerrar modal
  closeModal.addEventListener('click', cerrarModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal();
  });

  // Abrir modal modo agregar al hacer click en el botón
  addBtn.addEventListener('click', () => abrirModal());

  // -------- Evento para enviar formulario (guardar o editar) --------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const codigoTrim = inpCodigo.value.trim();
    const descripcionTrim = inpDescripcion.value.trim();

    // Validación simple
    if (!codigoTrim || !descripcionTrim) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    const payload = {
      codigo: codigoTrim,
      description: descripcionTrim
    };

    const url = editarId ? `${apiUrl}${editarId}/` : apiUrl;
    const method = editarId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error al guardar: ${res.status} ${errorText}`);
      }

      // Opcionalmente leer la respuesta si la API retorna el objeto guardado
      // const result = await res.json();

      cerrarModal();
      cargarTipoProductos();  // Recargar tabla con los datos actualizados
    } catch (error) {
      console.error('Error al guardar tipo de producto:', error);
      alert('Hubo un problema al guardar el tipo de producto.');
    }
  });

  // -------- Función para eliminar un tipo de producto (deshabilitada) --------
  function eliminarTipoProducto(id) {
    alert('No se puede eliminar un tipo de producto, por cuestiones internas.');
  }

  // Cargar los datos inicialmente
  cargarTipoProductos();
}

// Hacemos disponible la función init en window para poder llamarla desde otro script
window.init = init;
