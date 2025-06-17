function init() {
    // Referencias a elementos del DOM
    const tbody       = document.querySelector('#loadClientList tbody');
    const addBtn      = document.getElementById('addClientBtn');
    const modal       = document.getElementById('clienteModal');
    const closeModal  = document.getElementById('closeModal');
    const form        = document.getElementById('clienteForm');
    const title       = document.getElementById('modal-title');
    const apiUrl      = 'http://127.0.0.1:8000/api/Cliente/';

    // Campos del formulario
    const inpCodigo    = document.getElementById('codigo');
    const inpNombres   = document.getElementById('nombres');
    const inpApellidos = document.getElementById('apellidos');
    const inpTelefono  = document.getElementById('telefono');
    const inpDireccion = document.getElementById('direccion');
    const selEstado    = document.getElementById('estado');

    let editarId = null;  // ID del cliente que estamos editando (null = nuevo)

    // Función para cargar la tabla de clientes desde la API
    function cargarClientes() {
        fetch(apiUrl)
            .then(res => {
                if (!res.ok) throw new Error('Error al obtener clientes');
                return res.json();
            })
            .then(data => {
                tbody.innerHTML = '';
                data.forEach(item => {
                    const tr = tbody.insertRow();
                    tr.insertCell(0).textContent = item.id;
                    tr.insertCell(1).textContent = item.codigo;
                    tr.insertCell(2).textContent = item.nombres;
                    tr.insertCell(3).textContent = item.apellidos;
                    tr.insertCell(4).textContent = item.telefono;
                    tr.insertCell(5).textContent = item.direccion;
                    tr.insertCell(6).textContent = item.estado;

                    // Botón editar
                    const tdEdit = tr.insertCell(7);
                    const btnEdit = document.createElement('button');
                    btnEdit.classList.add('btn-edit');
                    btnEdit.setAttribute('aria-label', `Editar cliente ${item.codigo}`);
                    btnEdit.innerHTML = '<i class="bx bx-edit"></i>';
                    btnEdit.addEventListener('click', () => abrirModal(item));
                    tdEdit.appendChild(btnEdit);

                    // Botón eliminar
                    const tdDel = tr.insertCell(8);
                    const btnDel = document.createElement('button');
                    btnDel.classList.add('btn-delete');
                    btnDel.setAttribute('aria-label', `Eliminar cliente ${item.codigo}`);
                    btnDel.innerHTML = '<i class="bx bx-trash"></i>';
                    btnDel.addEventListener('click', () => eliminarCliente(item.id));
                    tdDel.appendChild(btnDel);
                });
            })
            .catch(err => {
                console.error('Error al cargar clientes:', err);
                tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:red;">Error cargando datos.</td></tr>';
            });
    }

    // Función para abrir el modal, ya sea para agregar o editar cliente
    function abrirModal(cliente = null) {
        editarId = cliente ? cliente.id : null;
        title.textContent = cliente ? 'Editar Cliente' : 'Agregar Cliente';

        inpCodigo.value    = cliente?.codigo    || '';
        inpNombres.value   = cliente?.nombres   || '';
        inpApellidos.value = cliente?.apellidos || '';
        inpTelefono.value  = cliente?.telefono  || '';
        inpDireccion.value = cliente?.direccion || '';
        selEstado.value    = cliente?.estado    || '1';

        modal.style.display = 'flex';

        // Foco en el primer campo para mejor usabilidad
        inpCodigo.focus();
    }

    // Función para cerrar el modal
    function cerrarModal() {
        modal.style.display = 'none';
        form.reset();
        editarId = null;
    }

    // Evento para cerrar modal al hacer click en la X
    closeModal.addEventListener('click', cerrarModal);

    // También cerrar modal si se hace clic fuera del contenido
    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModal();
    });

    // Evento para abrir modal en modo "agregar"
    addBtn.addEventListener('click', () => abrirModal());

    // Evento al enviar el formulario para guardar o editar
    form.addEventListener('submit', e => {
        e.preventDefault();

        // Validación básica
        if (
            !inpCodigo.value.trim() ||
            !inpNombres.value.trim() ||
            !inpApellidos.value.trim() ||
            !inpTelefono.value.trim() ||
            !inpDireccion.value.trim() ||
            !selEstado.value.trim()
        ) {
            alert('Por favor, complete todos los campos.');
            return;
        }

        const payload = {
            codigo:    inpCodigo.value.trim(),
            nombres:   inpNombres.value.trim(),
            apellidos: inpApellidos.value.trim(),
            telefono:  inpTelefono.value.trim(),
            direccion: inpDireccion.value.trim(),
            estado:    selEstado.value.trim()
        };

        const url = editarId ? `${apiUrl}${editarId}/` : apiUrl;
        const method = editarId ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al guardar cliente');
            return res.json();
        })
        .then(() => {
            cerrarModal();
            cargarClientes();
        })
        .catch(err => {
            console.error(err);
            alert('Hubo un problema al guardar el cliente.');
        });
    });

    // Función para eliminar cliente (marcar estado=0 o eliminar realmente)
    function eliminarCliente(id) {
        if (!confirm('¿Seguro que deseas dar de baja a este cliente?')) return;

        fetch(`${apiUrl}${id}/`, { method: 'DELETE' })
            .then(res => {
                if (!res.ok) throw new Error('Error al dar de baja cliente');
                cargarClientes();
            })
            .catch(err => {
                console.error(err);
                alert('No se pudo dar de baja al cliente.');
            });
    }

    // Carga inicial al abrir la página
    cargarClientes();
}

// Exportar la función para poder usarla desde el HTML
window.init = init;
