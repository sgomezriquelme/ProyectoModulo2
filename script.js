$(document).ready(function () {

    const BALANCE_KEY = 'balance';
    const CONTACTOS_KEY = 'contactos';
    const MOVIMIENTOS_KEY = 'movimientos';

    // =========================
    // FUNCIONES GENERALES
    // =========================

    function inicializarDatos() {
        if (localStorage.getItem(BALANCE_KEY) === null) {
            localStorage.setItem(BALANCE_KEY, 0);
        }

        if (localStorage.getItem(CONTACTOS_KEY) === null) {
            let contactosIniciales = [
                {
                    nombre: 'John Doe',
                    cuenta: '123456789',
                    alias: 'john.doe',
                    banco: 'ABC Bank'
                },
                {
                    nombre: 'Jane Smith',
                    cuenta: '987654321',
                    alias: 'jane.smith',
                    banco: 'XYZ Bank'
                }
            ];

            localStorage.setItem(CONTACTOS_KEY, JSON.stringify(contactosIniciales));
        }

        if (localStorage.getItem(MOVIMIENTOS_KEY) === null) {
            localStorage.setItem(MOVIMIENTOS_KEY, JSON.stringify([]));
        }
    }

    function obtenerBalance() {
        let balance = Number(localStorage.getItem(BALANCE_KEY));

        if (isNaN(balance)) {
            balance = 0;
            localStorage.setItem(BALANCE_KEY, balance);
        }

        return balance;
    }

    function guardarBalance(balance) {
        localStorage.setItem(BALANCE_KEY, balance);
    }

    function guardarMovimiento(tipo, monto, detalle) {
        let movimientos = JSON.parse(localStorage.getItem(MOVIMIENTOS_KEY)) || [];

        let movimiento = {
            tipo: tipo,
            monto: monto,
            detalle: detalle,
            fecha: new Date().toLocaleDateString('es-CL')
        };

        movimientos.unshift(movimiento);

        localStorage.setItem(MOVIMIENTOS_KEY, JSON.stringify(movimientos));
    }

    function mostrarMensajeYRedirigir(mensaje, pagina) {
        $('#messageContainer').html(`
            <div class="alert alerta-redireccion text-center" role="alert">
                ${mensaje}
            </div>
        `).show();

        setTimeout(function () {
            window.location.href = pagina;
        }, 1500);
    }

    inicializarDatos();

    // =========================
    // LOGIN
    // =========================

    if ($('#loginForm').length > 0) {

        $('#loginForm').submit(function (event) {
            event.preventDefault();

            let email = $('#email').val().trim();
            let password = $('#password').val().trim();

            $('#alertContainer').html('').show();

            if (email === '' || password === '') {

                $('#alertContainer').html(`
                    <div class="alert alert-danger text-center" role="alert">
                        Debe ingresar correo y contraseña.
                    </div>
                `).show();

                setTimeout(function () {
                    $('#alertContainer').fadeOut();
                }, 3000);

                return;
            }

            $('#alertContainer').html(`
                <div class="alert alert-success text-center" role="alert">
                    Inicio de sesión exitoso. Redirigiendo al menú principal...
                </div>
            `).show();

            setTimeout(function () {
                window.location.href = 'menu.html';
            }, 1500);
        });
    }

    // =========================
    // MENÚ PRINCIPAL
    // =========================

    if ($('#balance').length > 0) {

        let balance = obtenerBalance();

        $('#balance').text(balance.toLocaleString('es-CL'));

        $('#btnDepositar').click(function () {
            mostrarMensajeYRedirigir('Redirigiendo a Depositar...', 'deposit.html');
        });

        $('#btnEnviarDinero').click(function () {
            mostrarMensajeYRedirigir('Redirigiendo a Enviar Dinero...', 'sendmoney.html');
        });

        $('#btnUltimosMovimientos').click(function () {
            mostrarMensajeYRedirigir('Redirigiendo a Últimos Movimientos...', 'transactions.html');
        });

        $('#btnCerrarSesion').click(function () {
            mostrarMensajeYRedirigir('Cerrando sesión...', 'index.html');
        });
    }

    // =========================
    // DEPÓSITO
    // =========================

    if ($('#depositForm').length > 0) {

        let balance = obtenerBalance();

        $('#saldoActual').text(balance.toLocaleString('es-CL'));

        $('#depositForm').submit(function (event) {
            event.preventDefault();

            let monto = Number($('#depositAmount').val());

            $('#alert-container').html('').show();
            $('#deposit-message').html('');

            if (isNaN(monto) || monto <= 0) {

                $('#alert-container').html(`
                    <div class="alert alert-danger text-center" role="alert">
                        Debe ingresar un monto mayor a cero para depositar.
                    </div>
                `).show();

                setTimeout(function () {
                    $('#alert-container').fadeOut();
                }, 10000);

                return;
            }

            balance = balance + monto;
            guardarBalance(balance);

            guardarMovimiento('deposito', monto, 'Depósito en cuenta');

            $('#saldoActual').text(balance.toLocaleString('es-CL'));
            $('#depositForm')[0].reset();

            if ($('#modalDepositoExitoso').length > 0) {

                $('#mensajeMontoDepositado').html(`
                    Monto depositado: <strong>$${monto.toLocaleString('es-CL')}</strong>
                `);

                $('#modalDepositoExitoso').modal('show');

                setTimeout(function () {
                    $('#modalDepositoExitoso').modal('hide');

                    setTimeout(function () {
                        window.location.href = 'menu.html';
                    }, 500);

                }, 2500);

            } else {

                $('#alert-container').html(`
                    <div class="alert alert-success text-center" role="alert">
                        Depósito realizado con éxito. Redirigiendo al menú principal...
                    </div>
                `).show();

                setTimeout(function () {
                    window.location.href = 'menu.html';
                }, 2000);
            }
        });

        $('#btnVolverMenuDeposito').click(function () {
            window.location.href = 'menu.html';
        });
    }

    // =========================
    // ENVIAR DINERO
    // =========================

    if ($('#contactList').length > 0) {

        let contactoSeleccionado = null;

        function obtenerContactos() {
            let contactos = JSON.parse(localStorage.getItem(CONTACTOS_KEY)) || [];

            contactos = contactos.map(function (contacto) {
                return {
                    nombre: contacto.nombre || '',
                    cuenta: contacto.cuenta || contacto.cbu || '',
                    alias: contacto.alias || '',
                    banco: contacto.banco || ''
                };
            });

            localStorage.setItem(CONTACTOS_KEY, JSON.stringify(contactos));

            return contactos;
        }

        function guardarContactos(contactos) {
            localStorage.setItem(CONTACTOS_KEY, JSON.stringify(contactos));
        }

        function limpiarSeleccionContacto() {
            contactoSeleccionado = null;

            $('.contacto-item').removeClass('contacto-activo');
            $('.contacto-item').removeClass('active');
            $('input[name="contacto"]').prop('checked', false);

            $('#selectedContactText').hide().html('');
            $('#btnSendMoney').hide();
            $('#amountToSend').val('');

            $('#confirmationMessage').html('').show();
        }

        function mostrarContactos(contactos) {
            $('#contactList').html('');

            if (contactos.length === 0) {
                $('#contactList').html(`
                    <li class="list-group-item text-center">
                        No se encontraron contactos.
                    </li>
                `);
                return;
            }

            contactos.forEach(function (contacto) {
                $('#contactList').append(`
                    <li class="list-group-item contacto-item"
                        data-nombre="${contacto.nombre}"
                        data-cuenta="${contacto.cuenta}"
                        data-alias="${contacto.alias}"
                        data-banco="${contacto.banco}">

                        <div class="contacto-contenido">
                            <input type="radio" name="contacto" class="mr-3">

                            <div class="contact-info">
                                <span class="contact-name">${contacto.nombre}</span>

                                <div class="row">
                                    <div class="col-md-4 col-12 contact-details">
                                        Nro Cuenta: ${contacto.cuenta}
                                    </div>

                                    <div class="col-md-4 col-12 contact-details">
                                        Alias: ${contacto.alias}
                                    </div>

                                    <div class="col-md-4 col-12 contact-details">
                                        Banco: ${contacto.banco}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                `);
            });
        }

        function mostrarModalTransferencia(titulo, mensaje, extra, esError, redirigir) {
            if ($('#modalTransferencia').length === 0) {
                $('#confirmationMessage').html(`
                    <div class="alert ${esError ? 'alert-danger' : 'alert-success'} text-center" role="alert">
                        <strong>${titulo}</strong><br>
                        ${mensaje}<br>
                        <small>${extra || ''}</small>
                    </div>
                `).show();

                setTimeout(function () {
                    $('#confirmationMessage').fadeOut();

                    if (redirigir) {
                        window.location.href = 'menu.html';
                    }
                }, 2500);

                return;
            }

            $('#modalTransferenciaTitulo').text(titulo);
            $('#modalTransferenciaMensaje').html(mensaje);
            $('#modalTransferenciaExtra').text(extra || '');

            $('#modalTransferenciaContenido')
                .removeClass('modal-wallet-error')
                .addClass('modal-wallet');

            if (esError) {
                $('#modalTransferenciaContenido').addClass('modal-wallet-error');
            }

            $('#modalTransferencia').modal('show');

            setTimeout(function () {
                $('#modalTransferencia').modal('hide');

                if (redirigir) {
                    setTimeout(function () {
                        window.location.href = 'menu.html';
                    }, 500);
                }
            }, 2500);
        }

        mostrarContactos(obtenerContactos());

        $('#btnShowContactForm').click(function () {
            $('#newContactFormContainer').slideDown();
            $('#send-alert-container').html('').show();
        });

        $('#btnCancelContact').click(function () {
            $('#newContactFormContainer').slideUp();
            $('#newContactForm')[0].reset();

            $('#send-alert-container').html('').show();
            $('#accountFeedback').hide();
            $('#contactAccount').removeClass('input-error');
        });

        $('#contactAccount').on('input', function () {
            let cuenta = $(this).val().trim();

            if (cuenta !== '' && !/^[0-9]+$/.test(cuenta)) {
                $('#accountFeedback').text('El número de cuenta debe contener solo números.');
                $('#accountFeedback').fadeIn();
                $(this).addClass('input-error');
            } else {
                $('#accountFeedback').fadeOut();
                $(this).removeClass('input-error');
            }
        });

        $('#newContactForm').submit(function (event) {
            event.preventDefault();

            let nombre = $('#contactName').val().trim();
            let cuenta = $('#contactAccount').val().trim();
            let alias = $('#contactAlias').val().trim();
            let banco = $('#contactBank').val().trim();

            $('#send-alert-container').html('').show();

            if (nombre === '' || cuenta === '' || alias === '' || banco === '') {
                $('#send-alert-container').html(`
                    <div class="alert alert-danger text-center" role="alert">
                        Debe completar todos los datos del contacto.
                    </div>
                `).show();

                setTimeout(function () {
                    $('#send-alert-container').fadeOut();
                }, 10000);

                return;
            }

            if (!/^[0-9]+$/.test(cuenta)) {
                $('#accountFeedback').text('El número de cuenta debe contener solo números.');
                $('#accountFeedback').fadeIn();
                $('#contactAccount').addClass('input-error');
                return;
            }

            let contactos = obtenerContactos();

            contactos.push({
                nombre: nombre,
                cuenta: cuenta,
                alias: alias,
                banco: banco
            });

            guardarContactos(contactos);
            mostrarContactos(contactos);

            $('#send-alert-container').html(`
                <div class="alert alert-success text-center" role="alert">
                    Contacto agregado correctamente.
                </div>
            `).show();

            $('#newContactForm')[0].reset();
            $('#newContactFormContainer').slideUp();
            $('#accountFeedback').hide();
            $('#contactAccount').removeClass('input-error');

            setTimeout(function () {
                $('#send-alert-container').fadeOut();
            }, 4000);
        });

        $('#searchContact').on('keyup', function () {
            let textoBusqueda = $(this).val().trim().toLowerCase();
            let contactos = obtenerContactos();

            let contactosFiltrados = contactos.filter(function (contacto) {
                return contacto.nombre.toLowerCase().includes(textoBusqueda) ||
                    contacto.alias.toLowerCase().includes(textoBusqueda);
            });

            mostrarContactos(contactosFiltrados);
            limpiarSeleccionContacto();
        });

        $('#btnLimpiarBusqueda').click(function () {
            $('#searchContact').val('');
            mostrarContactos(obtenerContactos());

            limpiarSeleccionContacto();

            $('#send-alert-container').html('').show();
            $('#confirmationMessage').html('').show();
        });

        $(document).on('click', '.contacto-item', function () {
            contactoSeleccionado = {
                nombre: $(this).data('nombre'),
                cuenta: $(this).data('cuenta'),
                alias: $(this).data('alias'),
                banco: $(this).data('banco')
            };

            $('.contacto-item').removeClass('contacto-activo');
            $('.contacto-item').removeClass('active');

            $(this).addClass('contacto-activo');
            $(this).find('input[name="contacto"]').prop('checked', true);

            $('#selectedContactText')
                .html(`Contacto seleccionado: <strong>${contactoSeleccionado.nombre}</strong>`)
                .show();

            $('#btnSendMoney').show();
            $('#confirmationMessage').html('').show();
        });

        $('#btnSendMoney').click(function () {
            let monto = Number($('#amountToSend').val());
            let balance = obtenerBalance();

            $('#send-alert-container').html('').show();
            $('#confirmationMessage').html('').show();

            if (contactoSeleccionado === null) {
                mostrarModalTransferencia(
                    'Atención',
                    'Debe seleccionar un contacto antes de enviar dinero.',
                    '',
                    true,
                    false
                );
                return;
            }

            if (isNaN(monto) || monto <= 0) {
                mostrarModalTransferencia(
                    'Monto inválido',
                    'Debe ingresar un monto mayor a cero.',
                    '',
                    true,
                    false
                );
                return;
            }

            if (monto > balance) {
                mostrarModalTransferencia(
                    'Saldo insuficiente',
                    'No tiene saldo suficiente.',
                    `Saldo actual: $${balance.toLocaleString('es-CL')}`,
                    true,
                    false
                );
                return;
            }

            balance = balance - monto;
            guardarBalance(balance);

            guardarMovimiento(
                'transferencia_enviada',
                monto,
                'Enviado a ' + contactoSeleccionado.nombre
            );

            mostrarModalTransferencia(
                'Transferencia realizada con éxito',
                `Enviaste <strong>$${monto.toLocaleString('es-CL')}</strong> a <strong>${contactoSeleccionado.nombre}</strong>.`,
                'Redirigiendo al menú principal...',
                false,
                true
            );

            $('#amountToSend').val('');
            $('#btnSendMoney').hide();
            $('#selectedContactText').hide().html('');

            $('.contacto-item').removeClass('contacto-activo');
            $('.contacto-item').removeClass('active');
            $('input[name="contacto"]').prop('checked', false);

            contactoSeleccionado = null;
        });

        $('#btnVolverMenuSend').click(function () {
            window.location.href = 'menu.html';
        });
    }

    // =========================
    // ÚLTIMOS MOVIMIENTOS
    // =========================

    if ($('#transactionsList').length > 0) {

        let listaTransacciones = [
            {
                tipo: 'compra',
                monto: 50000,
                detalle: 'Compra en línea',
                fecha: '23-06-2026'
            },
            {
                tipo: 'deposito',
                monto: 100000,
                detalle: 'Depósito inicial',
                fecha: '23-06-2026'
            },
            {
                tipo: 'transferencia_recibida',
                monto: 75000,
                detalle: 'Transferencia recibida',
                fecha: '23-06-2026'
            },
            {
                tipo: 'compra',
                monto: 5550,
                detalle: 'Compra en supermercado',
                fecha: '24-06-2026'
            },
            {
                tipo: 'transferencia_recibida',
                monto: 10500,
                detalle: 'Transferencia recibida de contacto',
                fecha: '24-06-2026'
            }
        ];

        let movimientosGuardados = JSON.parse(localStorage.getItem(MOVIMIENTOS_KEY)) || [];
        let movimientosFinales = movimientosGuardados.concat(listaTransacciones);

        mostrarUltimosMovimientos('todos');

        $('#filterType').change(function () {
            let filtro = $(this).val();
            mostrarUltimosMovimientos(filtro);
        });

        $('#btnVolverMenuTransactions').click(function () {
            window.location.href = 'menu.html';
        });

        function mostrarUltimosMovimientos(filtro) {
            $('#transactionsList').html('');

            let movimientosFiltrados = movimientosFinales;

            if (filtro !== 'todos') {
                movimientosFiltrados = movimientosFinales.filter(function (movimiento) {
                    return movimiento.tipo === filtro;
                });
            }

            if (movimientosFiltrados.length === 0) {
                $('#transactionsList').html(`
                    <li class="list-group-item text-center">
                        No existen movimientos para el tipo seleccionado.
                    </li>
                `);
                return;
            }

            movimientosFiltrados.forEach(function (movimiento) {
                let tipoLegible = getTipoTransaccion(movimiento.tipo);
                let claseMonto = getClaseMonto(movimiento.tipo);
                let signo = getSignoMonto(movimiento.tipo);

                $('#transactionsList').append(`
                    <li class="list-group-item movimiento-item">
                        <div class="d-flex justify-content-between align-items-center">

                            <div>
                                <div class="movimiento-titulo">
                                    ${tipoLegible}
                                </div>

                                <div class="movimiento-detalle">
                                    ${movimiento.detalle}
                                </div>

                                <div class="movimiento-detalle">
                                    ${movimiento.fecha}
                                </div>
                            </div>

                            <div class="${claseMonto}">
                                ${signo}$${Number(movimiento.monto).toLocaleString('es-CL')}
                            </div>

                        </div>
                    </li>
                `);
            });
        }

        function getTipoTransaccion(tipo) {
            if (tipo === 'compra') {
                return 'Compra';
            } else if (tipo === 'deposito') {
                return 'Depósito';
            } else if (tipo === 'transferencia_recibida') {
                return 'Transferencia recibida';
            } else if (tipo === 'transferencia_enviada') {
                return 'Transferencia enviada';
            } else {
                return 'Movimiento';
            }
        }

        function getClaseMonto(tipo) {
            if (tipo === 'compra' || tipo === 'transferencia_enviada') {
                return 'monto-negativo';
            } else {
                return 'monto-positivo';
            }
        }

        function getSignoMonto(tipo) {
            if (tipo === 'compra' || tipo === 'transferencia_enviada') {
                return '-';
            } else {
                return '+';
            }
        }
    }

});