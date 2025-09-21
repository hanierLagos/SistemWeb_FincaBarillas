function init() {
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
    const inpPrecioVenta = document.getElementById('precioVenta');
    const selEstado = document.getElementById('estado');

    const apiUrl = 'http://127.0.0.1:8000/api/Producto/';
    const apiTipoProductoUrl = 'http://127.0.0.1:8000/api/TipoProducto/';
    let editarId = null;

    // --- Nueva función para obtener los encabezados de autenticación JWT ---
    function getAuthHeaders() {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('Sesión expirada o no autenticado. Por favor, inicie sesión.');
            window.location.href = 'login.html';
            return null;
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    async function cargarProductos() {
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const res = await fetch(apiUrl, { headers });
            const contentType = res.headers.get('content-type');
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Error ${res.status}: ${text}`);
            }
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Respuesta no es JSON');
            }
            const data = await res.json();
            
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
                tr.insertCell(7).textContent = item.precioVenta ? parseFloat(item.precioVenta).toFixed(2) : '0.00';
                tr.insertCell(8).textContent = item.estado || '';

                // Botón Editar
                const tdEdit = tr.insertCell(9);
                const btnEdit = document.createElement('button');
                btnEdit.classList.add('btn-edit');
                btnEdit.innerHTML = '<i class="bx bx-edit"></i>';
                btnEdit.addEventListener('click', () => abrirModal(item));
                tdEdit.appendChild(btnEdit);

                // Botón Eliminar
                const tdDel = tr.insertCell(10);
                const btnDel = document.createElement('button');
                btnDel.classList.add('btn-delete');
                btnDel.innerHTML = '<i class="bx bx-trash"></i>';
                btnDel.addEventListener('click', () => eliminarProducto(item.id_producto || item.id));
                tdDel.appendChild(btnDel);
            });
        } catch (err) {
            console.error('Error cargando productos:', err);
        }
    }

    async function cargarTiposProducto() {
        const headers = getAuthHeaders();
        if (!headers) {
            selectTipoProducto.innerHTML = '<option value="">No se pudieron cargar los tipos</option>';
            return;
        }

        try {
            const res = await fetch(apiTipoProductoUrl, { headers });
            const contentType = res.headers.get('content-type');
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Error ${res.status}: ${text}`);
            }
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Respuesta no es JSON');
            }
            const data = await res.json();

            selectTipoProducto.innerHTML = '<option value="">Seleccione un tipo</option>';
            data.forEach(tipo => {
                const option = document.createElement('option');
                option.value = tipo.id;
                option.textContent = tipo.description || tipo.nombre || 'Tipo desconocido';
                selectTipoProducto.appendChild(option);
            });
        } catch (err) {
            console.error('Error cargando tipos de productos:', err);
            selectTipoProducto.innerHTML = '<option value="">No se pudieron cargar los tipos</option>';
        }
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
            inpFechaSiembra.value = `${yyyy}-${mm}-${dd}`;
        } else {
            inpFechaSiembra.value = '';
        }

        inpCantidadDisp.value = producto?.CantidadDisponible || '';
        inpCantidadMinima.value = producto?.CantidadMinima || '';
        inpPrecioVenta.value = producto?.precioVenta || '';
        selEstado.value = producto?.estado || 'Activo';

        if (producto?.tipoProducto) {
            selectTipoProducto.value = producto.tipoProducto.id || '';
        } else if (producto?.tipoProductoId) {
            selectTipoProducto.value = producto.tipoProductoId || '';
        } else {
            selectTipoProducto.value = '';
        }

        modal.style.display = 'flex';
    }

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        form.reset();
        editarId = null;
    });

    addBtn.addEventListener('click', () => abrirModal());

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const headers = getAuthHeaders();
        if (!headers) return;

        if (!inpCodigo.value.trim() || !inpNombres.value.trim() || !selectTipoProducto.value) {
            alert('Por favor complete todos los campos requeridos.');
            return;
        }

        const productoData = {
            codigoCultivo: inpCodigo.value.trim(),
            nombre: inpNombres.value.trim(),
            tipoProductoId: Number(selectTipoProducto.value),
            FechaSiembra: inpFechaSiembra.value || null,
            CantidadDisponible: Number(inpCantidadDisp.value) || 0,
            CantidadMinima: Number(inpCantidadMinima.value) || 0,
            precioVenta: parseFloat(inpPrecioVenta.value) || 0.00,
            estado: selEstado.value,
        };

        const url = editarId ? `${apiUrl}${editarId}/` : apiUrl;
        const method = editarId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(productoData)
            });

            if (!res.ok) {
                const err = await res.json();
                throw err;
            }
            await res.json();
            cargarProductos();
            modal.style.display = 'none';
            form.reset();
            editarId = null;
        } catch (err) {
            console.error('Respuesta con error:', err);
            alert('Error al guardar producto: ' + JSON.stringify(err));
        }
    });

    async function eliminarProducto(id) {
        if (!id) {
            alert('ID inválido para eliminar');
            return;
        }

        if (!confirm('¿Está seguro de eliminar este producto?')) return;

        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const res = await fetch(`${apiUrl}${id}/`, {
                method: 'DELETE',
                headers
            });

            if (res.status === 204 || res.ok) {
                cargarProductos();
            } else {
                const text = await res.text();
                throw new Error(text || 'No se pudo eliminar');
            }
        } catch (err) {
            console.error('Error al eliminar producto:', err);
            alert('Error al eliminar producto: ' + err.message);
        }
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

window.init = init;