function init() {
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

    // Cargar tabla
    function cargarClientes() {
        fetch(apiUrl)
            .then(res => res.json())
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

                    // Editar
                    const tdEdit = tr.insertCell(7);
                    const btnEdit = document.createElement('button');
                    btnEdit.classList.add('btn-edit');
                    btnEdit.innerHTML = '<i class="bx bx-edit"></i>';
                    btnEdit.addEventListener('click', () => abrirModal(item));
                    tdEdit.appendChild(btnEdit);

                    // Eliminar
                    const tdDel = tr.insertCell(8);
                    const btnDel = document.createElement('button');
                    btnDel.classList.add('btn-delete');
                    btnDel.innerHTML = '<i class="bx bx-trash"></i>';
                    btnDel.addEventListener('click', () => eliminarCliente(item.id));
                    tdDel.appendChild(btnDel);
                });
            })
            .catch(err => {
                console.error('Error al cargar clientes:', err);
                tbody.innerHTML = '<tr><td colspan="9">Error cargando datos.</td></tr>';
            });
    }

    // Abrir modal: si recibimos un cliente, vamos a editar; si no, creamos nuevo
    function abrirModal(cliente = null) {
        editarId = cliente ? cliente.id : null;
        title.textContent = cliente ? 'Editar Cliente' : 'Agregar Cliente';

        inpCodigo.value    = cliente?.codigo    || '';
        inpNombres.value   = cliente?.nombres   || '';
        inpApellidos.value = cliente?.apellidos || '';
        inpTelefono.value  = cliente?.telefono  || '';
        inpDireccion.value = cliente?.direccion || '';
        selEstado.value    = cliente?.estado    || '1';

        modal.style.display = 'block';
    }

    // Cerrar modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Botón "Agregar Cliente"
    addBtn.addEventListener('click', () => abrirModal());

    // Enviar formulario
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const payload = {
            codigo:    inpCodigo.value.trim(),
            nombres:   inpNombres.value.trim(),
            apellidos: inpApellidos.value.trim(),
            telefono:  inpTelefono.value.trim(),
            direccion: inpDireccion.value.trim(),
            estado:    selEstado.value.trim()
        };

<<<<<<< HEAD
        const url    = editarId ? `${apiUrl}${editarId}/` : apiUrl;
=======
        const url    = editarId ? ${apiUrl}${editarId}/ : apiUrl;
>>>>>>> 653e3b069a7181ccb840aede4ca097c2e2dcaf78
        const method = editarId ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al guardar');
            modal.style.display = 'none';
            cargarClientes();
        })
        .catch(err => {
            console.error(err);
            alert('Hubo un problema al guardar el cliente.');
        });
    });

    // Eliminar cliente (marcar estado=0)
    function eliminarCliente(id) {
        if (!confirm('¿Seguro que deseas dar de baja a este cliente?')) return;

<<<<<<< HEAD
        fetch(`${apiUrl}${id}/`, { method: 'DELETE' })
=======
        fetch(${apiUrl}${id}/, { method: 'DELETE' })
>>>>>>> 653e3b069a7181ccb840aede4ca097c2e2dcaf78
            .then(res => {
                if (!res.ok) throw new Error('Error al dar de baja');
                cargarClientes();
            })
            .catch(err => {
                console.error(err);
                alert('No se pudo dar de baja al cliente.');
            });
    }

    // Carga inicial
    cargarClientes();
}

// Exporta la función para poder usarla en la carga dinámica
<<<<<<< HEAD
window.init = init;
=======
window.init = init;
>>>>>>> 653e3b069a7181ccb840aede4ca097c2e2dcaf78
