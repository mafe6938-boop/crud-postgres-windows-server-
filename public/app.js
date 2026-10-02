// ======================================
// COMPROBAR SESIÓN
// ======================================

const usuario = sessionStorage.getItem("usuario");

if (!usuario) {

    window.location.href = "login.html";

}

document.getElementById("usuarioActual").textContent = usuario;


// ======================================
// CARGAR PRODUCTOS
// ======================================

async function cargarProductos() {

    try {

        const respuesta =
            await fetch("/api/productos");

        const productos =
            await respuesta.json();

        const tabla =
            document.getElementById("tablaProductos");

        tabla.innerHTML = "";

        if (productos.length === 0) {

            tabla.innerHTML = `
                <tr>
                    <td colspan="5">
                        No hay productos registrados
                    </td>
                </tr>
            `;

            return;
        }

        productos.forEach(producto => {

            tabla.innerHTML += `

                <tr>

                    <td>${producto.id}</td>

                    <td>${producto.nombre}</td>

                    <td>$${producto.precio}</td>

                    <td>${producto.cantidad}</td>

                    <td>

                        <button
                            onclick='editarProducto(${JSON.stringify(producto)})'>

                            Editar

                        </button>

                        <button
                            class="eliminar"
                            onclick="eliminarProducto(${producto.id})">

                            Eliminar

                        </button>

                    </td>

                </tr>

            `;

        });

    } catch (error) {

        console.error(error);

    }

}


// ======================================
// GUARDAR PRODUCTO
// ======================================

async function guardarProducto() {

    const id =
        document.getElementById("id").value;

    const nombre =
        document.getElementById("nombre").value;

    const precio =
        document.getElementById("precio").value;

    const cantidad =
        document.getElementById("cantidad").value;

    if (!nombre || !precio || !cantidad) {

        mostrarMensaje(
            "Todos los campos son obligatorios",
            "error"
        );

        return;

    }

    const producto = {

        nombre: nombre,
        precio: Number(precio),
        cantidad: Number(cantidad)

    };

    try {

        let respuesta;

        if (id) {

            respuesta = await fetch(
                `/api/productos/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(producto)
                }
            );

        } else {

            respuesta = await fetch(
                "/api/productos",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(producto)
                }
            );

        }

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            mostrarMensaje(
                datos.mensaje || "Error",
                "error"
            );

            return;

        }

        mostrarMensaje(
            id
                ? "Producto actualizado correctamente"
                : "Producto agregado correctamente",
            "exito"
        );

        limpiarFormulario();

        cargarProductos();

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "Error de conexión con el servidor",
            "error"
        );

    }

}


// ======================================
// EDITAR PRODUCTO
// ======================================

function editarProducto(producto) {

    document.getElementById("id").value =
        producto.id;

    document.getElementById("nombre").value =
        producto.nombre;

    document.getElementById("precio").value =
        producto.precio;

    document.getElementById("cantidad").value =
        producto.cantidad;

    document.getElementById("tituloFormulario")
        .textContent = "Editar producto";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ======================================
// ELIMINAR PRODUCTO
// ======================================

async function eliminarProducto(id) {

    const confirmar =
        confirm("¿Deseas eliminar este producto?");

    if (!confirmar) {
        return;
    }

    try {

        const respuesta =
            await fetch(`/api/productos/${id}`, {

                method: "DELETE"

            });

        const datos =
            await respuesta.json();

        if (respuesta.ok) {

            mostrarMensaje(
                "Producto eliminado correctamente",
                "exito"
            );

            cargarProductos();

        } else {

            mostrarMensaje(
                datos.mensaje,
                "error"
            );

        }

    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "Error al eliminar producto",
            "error"
        );

    }

}


// ======================================
// LIMPIAR FORMULARIO
// ======================================

function limpiarFormulario() {

    document.getElementById("id").value = "";

    document.getElementById("nombre").value = "";

    document.getElementById("precio").value = "";

    document.getElementById("cantidad").value = "";

    document.getElementById("tituloFormulario")
        .textContent = "Agregar producto";

}


// ======================================
// MENSAJES
// ======================================

function mostrarMensaje(texto, tipo) {

    const mensaje =
        document.getElementById("mensaje");

    mensaje.textContent = texto;

    mensaje.className = tipo;

    setTimeout(() => {

        mensaje.textContent = "";

    }, 3000);

}


// ======================================
// CERRAR SESIÓN
// ======================================

function cerrarSesion() {

    sessionStorage.removeItem("usuario");

    window.location.href = "login.html";

}


// ======================================
// INICIAR
// ======================================

cargarProductos();