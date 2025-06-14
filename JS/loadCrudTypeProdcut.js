function init() {

    // Referencias a elementos del DOM
    const tbody       = document.querySelector('#loadTypeProductList tbody');  // Cuerpo de la tabla
    const addBtn      = document.getElementById('addTypeProductBtn');          // Botón "Agregar Tipo de Producto"
    const modal       = document.getElementById('typeProductModal');          // Modal de agregar/editar
    const closeModal  = document.getElementById('closeModal');               // Botón cerrar modal (X)
    const form        = document.getElementById('typeProductForm');            // Formulario dentro del modal
    const title       = document.getElementById('modal-title');                // Título del modal
    const apiUrl      = 'http://127.0.0.1:8000/api/TipoProducto/';             // URL base de la API

    // Referencias a campos del formulario
    const inpCodigo       = document.getElementById('codigo');                 // Campo código
    const inpDescripcion  = document.getElementById('description');            // Campo descripción

    // Variable que indica si estamos editando un tipo de producto
    let editarId = null;

    // Función para cargar los tipos de productos desde la API y mostrarlos en la tabla
    function cargarTipoProductos() {
        fetch(apiUrl)
            .then(res => res.json())          // Convertimos la respuesta en JSON
            .then(data => {
                tbody.innerHTML = '';         // Limpiamos la tabla

                // Iteramos sobre cada tipo de producto recibido
                data.forEach(item => {
                    const tr = tbody.insertRow(); // Creamos una fila nueva

                    // Insertamos las celdas con los datos
                    tr.insertCell(0).textContent = item.id;
                    tr.insertCell(1).textContent = item.codigo;
                    tr.insertCell(2).textContent = item.description;

                    // Botón editar
                    const tdEdit = tr.insertCell(3);
                    const btnEdit = document.createElement('button');
                    btnEdit.classList.add('btn-edit');
                    btnEdit.innerHTML = '<i class="bx bx-edit"></i>';
                    btnEdit.addEventListener('click', () => abrirModal(item)); // Abrimos el modal con los datos cargados
                    tdEdit.appendChild(btnEdit);

                    // Botón eliminar
                    const tdDel = tr.insertCell(4);
                    const btnDel = document.createElement('button');
                    btnDel.classList.add('btn-delete');
                    btnDel.innerHTML = '<i class="bx bx-trash"></i>';
                    btnDel.addEventListener('click', () => eliminarTipoProducto(item.id)); // Eliminar (desactivado por ahora)
                    tdDel.appendChild(btnDel);
                });
            })
            .catch(err => {
                console.error('Error al cargar los tipos de productos:', err);
            });
    }

    // Función para abrir el modal, ya sea para agregar o editar
    function abrirModal(typeProduct = null) {
        editarId = typeProduct ? typeProduct.id : null; // Si existe, estamos editando
        title.textContent = typeProduct ? 'Editar Tipo de Producto' : 'Agregar Tipo de Producto';

        // Llenamos los campos si es edición, o los dejamos vacíos si es nuevo
        inpCodigo.value       = typeProduct?.codigo || '';
        inpDescripcion.value  = typeProduct?.description || '';

        // Mostramos el modal
        modal.style.display = 'block';
    }

    // Cierra el modal cuando se hace click en la X
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Abre el modal en modo "agregar" al hacer click en el botón correspondiente
    addBtn.addEventListener('click', () => abrirModal());

    // Evento al enviar el formulario (guardar o editar)
    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevenimos el envío tradicional del formulario

        // Creamos el objeto con los datos del formulario
        const payload = {
            codigo:      inpCodigo.value.trim(),
            description: inpDescripcion.value.trim()
        };

        // Determinamos si es una creación (POST) o una actualización (PUT)
        const url    = editarId ? ${apiUrl}${editarId}/ : apiUrl;
        const method = editarId ? 'PUT' : 'POST';

        // Enviamos los datos a la API
        fetch(url, {
            method ,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al guardar');
            modal.style.display = 'none';  // Cerramos el modal
            cargarTipoProductos();         // Recargamos los datos de la tabla
        })
        .catch(err => {
            console.error(err);
            alert('Hubo un problema al guardar el tipo de producto.');
        });
    });

    // Función para eliminar un tipo de producto (deshabilitada por motivos internos)
    function eliminarTipoProducto(id) {
        alert('No se puede eliminar un tipo de producto, por cuestiones internas.');
    }

    // Cargamos los datos al inicio cuando se abre la página
    cargarTipoProductos();
};

window.init = init; // Exponemos la función init para que pueda ser llamada desde el HTML
