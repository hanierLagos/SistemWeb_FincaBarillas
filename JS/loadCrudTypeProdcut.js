// La función init() encapsula toda la lógica para evitar que las variables
// se vuelvan globales.
function init() {
    // Referencias a elementos del DOM
    const tbody = document.querySelector('#loadTypeProductList tbody');
    const addBtn = document.getElementById('addTypeProductBtn');
    const modal = document.getElementById('typeProductModal');
    const closeModal = document.getElementById('closeModal');
    const form = document.getElementById('typeProductForm');
    const title = document.getElementById('modal-title');
    const apiUrl = 'http://127.0.0.1:8000/api/TipoProducto/';

    // Referencias a campos del formulario
    const inpCodigo = document.getElementById('codigo');
    const inpDescripcion = document.getElementById('description');

    let editarId = null;

    // --- Función para obtener los encabezados de autenticación JWT ---
    // Esta función es vital para la seguridad.
    function getAuthHeaders() {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('Sesión expirada o no autenticado. Por favor, inicie sesión.');
            window.location.href = 'login.html';
            return null; // Detiene la ejecución si no hay token
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Formato estándar para enviar el token
        };
    }

    // -------- Función para cargar los tipos de productos desde la API y mostrarlos --------
    async function cargarTipoProductos() {
        const headers = getAuthHeaders();
        if (!headers) return; // Si no hay token, no hacemos la llamada a la API.

        try {
            const res = await fetch(apiUrl, { headers });
            if (res.status === 401 || res.status === 403) {
                throw new Error('No autorizado. Tu token puede haber expirado.');
            }
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Error al cargar tipos de productos (status: ${res.status}): ${errorText}`);
            }
            const data = await res.json();

            tbody.innerHTML = '';
            data.forEach(item => {
                const tr = document.createElement('tr');

                tr.appendChild(crearCeldaTexto(item.id));
                tr.appendChild(crearCeldaTexto(item.codigo));
                tr.appendChild(crearCeldaTexto(item.description));

                const tdEdit = document.createElement('td');
                const btnEdit = document.createElement('button');
                btnEdit.classList.add('btn-edit');
                btnEdit.setAttribute('aria-label', `Editar tipo de producto ${item.codigo}`);
                btnEdit.innerHTML = '<i class="bx bx-edit"></i>';
                btnEdit.addEventListener('click', () => abrirModal(item));
                tdEdit.appendChild(btnEdit);
                tr.appendChild(tdEdit);

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
                                    Error al cargar los tipos de productos. ${error.message}
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

        inpCodigo.value = typeProduct?.codigo || '';
        inpDescripcion.value = typeProduct?.description || '';

        modal.style.display = 'flex';
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

        const headers = getAuthHeaders();
        if (!headers) return; // Si no hay token, no hacemos la llamada.

        const codigoTrim = inpCodigo.value.trim();
        const descripcionTrim = inpDescripcion.value.trim();

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
                headers, // <-- Aquí se usan los encabezados con el token
                body: JSON.stringify(payload),
            });

            if (res.status === 401 || res.status === 403) {
                throw new Error('No autorizado. Tu token puede haber expirado.');
            }
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Error al guardar: ${res.status} ${errorText}`);
            }

            cerrarModal();
            cargarTipoProductos();
        } catch (error) {
            console.error('Error al guardar tipo de producto:', error);
            alert('Hubo un problema al guardar el tipo de producto: ' + error.message);
        }
    });

    // -------- Función para eliminar un tipo de producto --------
    function eliminarTipoProducto(id) {
        alert('No se puede eliminar un tipo de producto, por cuestiones internas.');
    }

    // Cargar los datos inicialmente
    cargarTipoProductos();
}

// Hacemos disponible la función init en window para poder llamarla desde otro script
window.init = init;