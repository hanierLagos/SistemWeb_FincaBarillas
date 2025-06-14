function init () {
  const tbody = document.querySelector('#loadProductList tbody');
  const addBtn = document.getElementById('addProductBtn');
  const modal = document.getElementById('productModal');
  const closeModal = document.getElementById('closeModal');
  const form = document.getElementById('productForm');
  const title = document.getElementById('modal-title');

  // Campos del formulario
  const inpCodigo = document.getElementById('codigoCultivo');
  const inpNombres = document.getElementById('nombre');
  const selectTipoProducto = document.getElementById('tipoProductoDescripcion');
  const inpFechaSiembra = document.getElementById('fechaSiembra');
  const inpCantidadDisp = document.getElementById('cantidadDisponible');
  const inpCantidadMinima = document.getElementById('cantidadMinima');
  const selEstado = document.getElementById('estado');

  const apiUrl = 'http://127.0.0.1:8000/api/Producto/';
  const apiTipoProductoUrl = 'http://127.0.0.1:8000/api/TipoProducto/';
  let editarId = null;

  function cargarProductos() {
    fetch(apiUrl)
      .then(res => {
        const contentType = res.headers.get('content-type');
        if (!res.ok) {
          return res.text().then(text => { throw new Error(Error ${res.status}: ${text}); });
        }
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        } else {
          throw new Error('Respuesta no es JSON');
        }
      })
      .then(data => {
        tbody.innerHTML = '';
        data.forEach(item => {
          const tr = tbody.insertRow();
          tr.insertCell(0).textContent = item.id_producto || item.id || '';
          tr.insertCell(1).textContent = item.codigoCultivo || '';
          tr.insertCell(2).textContent = item.nombre || '';

          const tipoText = item.tipoProductoDescripcion || 
            (item.tipoProducto ? item.tipoProducto.description || '' : '');
          tr.insertCell(3).textContent = tipoText;

          tr.insertCell(4).textContent = item.FechaSiembra || 'No especificada';
          tr.insertCell(5).textContent = item.CantidadDisponible || 0;
          tr.insertCell(6).textContent = item.CantidadMinima || 0;
          tr.insertCell(7).textContent = item.estado || '';

          // Botón Editar
          const tdEdit = tr.insertCell(8);
          const btnEdit = document.createElement('button');
          btnEdit.classList.add('btn-edit');
          btnEdit.innerHTML = '<i class="bx bx-edit"></i>';
          btnEdit.addEventListener('click', () => abrirModal(item));
          tdEdit.appendChild(btnEdit);

          // Botón Eliminar
          const tdDel = tr.insertCell(9);
          const btnDel = document.createElement('button');
          btnDel.classList.add('btn-delete');
          btnDel.innerHTML = '<i class="bx bx-trash"></i>';
          btnDel.addEventListener('click', () => eliminarProducto(item.id_producto || item.id));
          tdDel.appendChild(btnDel);
        });
      })
      .catch(err => console.error('Error cargando productos:', err));
  }

  function cargarTiposProducto() {
    return fetch(apiTipoProductoUrl)
      .then(res => {
        const contentType = res.headers.get('content-type');
        if (!res.ok) {
          return res.text().then(text => { throw new Error(Error ${res.status}: ${text}); });
        }
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        } else {
          throw new Error('Respuesta no es JSON');
        }
      })
      .then(data => {
        selectTipoProducto.innerHTML = '<option value="">Seleccione un tipo</option>';
        data.forEach(tipo => {
          const option = document.createElement('option');
          option.value = tipo.id; // Solo guardamos el ID
          option.textContent = tipo.description || tipo.nombre || 'Tipo desconocido';
          selectTipoProducto.appendChild(option);
        });
      })
      .catch(err => {
        console.error('Error cargando tipos de productos:', err);
        selectTipoProducto.innerHTML = '<option value="">No se pudieron cargar los tipos</option>';
      });
  }

  function abrirModal(producto = null) {
    editarId = producto ? producto.id_producto || producto.id : null;
    title.textContent = producto ? 'Editar Producto' : 'Agregar Producto';

    inpCodigo.value = producto?.codigoCultivo || '';
    inpNombres.value = producto?.nombre || '';

    if (producto?.FechaSiembra) {
      const fecha = new Date(producto.FechaSiembra);
      const yyyy = fecha.getFullYear();
      const mm = String(fecha.getMonth() + 1).padStart(2, '0');
      const dd = String(fecha.getDate()).padStart(2, '0');
      inpFechaSiembra.value = ${yyyy}-${mm}-${dd};
    } else {
      inpFechaSiembra.value = '';
    }

    inpCantidadDisp.value = producto?.CantidadDisponible || '';
    inpCantidadMinima.value = producto?.CantidadMinima || '';
    selEstado.value = producto?.estado || 'Activo';

    if (producto && producto.tipoProductoId) {
      selectTipoProducto.value = producto.tipoProductoId || '';
    } else if (producto && producto.tipoProductoDescripcion) {
      const option = Array.from(selectTipoProducto.options)
        .find(opt => opt.textContent.trim() === producto.tipoProductoDescripcion.trim());
      selectTipoProducto.value = option ? option.value : '';
    } else {
      selectTipoProducto.value = '';
    }

    modal.style.display = 'block';
  }

  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    form.reset();
    editarId = null;
  });

  addBtn.addEventListener('click', () => abrirModal());

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!inpCodigo.value.trim() || !inpNombres.value.trim() || !selectTipoProducto.value) {
      alert('Por favor complete todos los campos requeridos.');
      return;
    }

    const productoData = {
        codigoCultivo: inpCodigo.value.trim(),
        nombre: inpNombres.value.trim(),
        tipoProductoId: selectTipoProducto.value ? Number(selectTipoProducto.value) : null,
        FechaSiembra: inpFechaSiembra.value || null,
        CantidadDisponible: Number(inpCantidadDisp.value) || 0,
        CantidadMinima: Number(inpCantidadMinima.value) || 0,
        estado: selEstado.value,
    };


    const url = editarId ? ${apiUrl}${editarId}/ : apiUrl;
    const method = editarId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productoData)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw err; });
        }
        return res.json();
      })
      .then(() => {
        cargarProductos();
        modal.style.display = 'none';
        form.reset();
        editarId = null;
      })
      .catch(err => {
        console.error('Respuesta con error:', err);
        alert('Error al guardar producto: ' + JSON.stringify(err));
      });
  });

  function eliminarProducto(id) {
    if (!id) {
      alert('ID inválido para eliminar');
      return;
    }

    if (!confirm('¿Está seguro de eliminar este producto?')) return;

    fetch(${apiUrl}${id}/, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status === 204 || res.ok) {
          cargarProductos();
        } else {
          return res.text().then(text => { throw new Error(text || 'No se pudo eliminar'); });
        }
      })
      .catch(err => {
        console.error('Error al eliminar producto:', err);
        alert('Error al eliminar producto: ' + err.message);
      });
  }


  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      form.reset();
      editarId = null;
    }
  });

  // Llamadas iniciales
  cargarTiposProducto();
  cargarProductos();
};

window.init = init; // Exponer la función init para que pueda ser llamada desde otros scripts