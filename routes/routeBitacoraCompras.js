// routes/routeBitacoraCompras.js
const express = require('express');
const router = express.Router();
const registroSolicitudCompra = require('../models/modelSolicitudCompra');
const registroActivo = require('../models/modelRegistroActivo');
const authMiddleware = require('../middleware/authMiddleware');
const ExcelJS = require('exceljs');

// BITÁCORA DE COMPRAS CON FILTROS
router.get('/bitacora', authMiddleware, async (req, res) => {
    try {
        const { proveedor, estatus, dias, tipoCompra, clasificacion } = req.query;

        // Construir filtros
        let filtro = {};

        // Filtrar por proveedor (búsqueda en razonSocial o nickname)
        if (proveedor) {
            filtro['proveedores'] = {
                $elemMatch: {
                    $or: [
                        { razonSocial: { $regex: proveedor, $options: 'i' } },
                        { nickname: { $regex: proveedor, $options: 'i' } }
                    ]
                }
            };
        }

        // Filtrar por estatus
        if (estatus) {
            filtro.estatusCompras = estatus;
        }

        // Filtrar por clasificación
        if (clasificacion) {
            filtro.clasificacionCompras = clasificacion;
        }

        // Filtrar por tipo de compra (de conceptoActivo)
        if (tipoCompra) {
            filtro['conceptoActivo.sc_cca_descripcion'] = { $regex: tipoCompra, $options: 'i' };
        }

        // Filtrar por días
        if (dias) {
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - parseInt(dias));
            filtro.fechaCreacion = { $gte: fechaLimite };
        }

        // Obtener solicitudes con filtros
        const solicitudes = await registroSolicitudCompra.find(filtro)
            .sort({ fechaCreacion: -1 })
            .lean();

        // Calcular estadísticas detalladas
        let estadisticas = {
            totalSolicitudes: solicitudes.length,
            montoTotal: 0,
            promedioPorSolicitud: 0,
            solicitudesPorEstatus: {},
            montoPorEstatus: {},
            solicitudesPorClasificacion: {},
            montoPorClasificacion: {}
        };

        // Inicializar contadores por estatus
        const estatusPosibles = ['Pendiente', 'Proceso', 'Autorizada', 'Cancelada', 'Rechazada', 'Completada'];
        estatusPosibles.forEach(estatus => {
            estadisticas.solicitudesPorEstatus[estatus] = 0;
            estadisticas.montoPorEstatus[estatus] = 0;
        });

        let totalConProveedorSeleccionado = 0;
        // Procesar cada solicitud
        solicitudes.forEach(solicitud => {
            // Calcular monto total de la solicitud (suma de todos los montos de proveedores)
            let montoSolicitud = 0;

            // Verificar si tiene proveedor seleccionado
            let tieneProveedorSeleccionado = false;
            if (solicitud.conceptoActivo && Array.isArray(solicitud.conceptoActivo)) {
                tieneProveedorSeleccionado = solicitud.conceptoActivo.some(a => a.proveedorSeleccionado);
            }

            if (tieneProveedorSeleccionado) {
                totalConProveedorSeleccionado++;
            }

            // Sumar montos de proveedores
            if (solicitud.proveedores && Array.isArray(solicitud.proveedores)) {
                solicitud.proveedores.forEach(proveedor => {
                    if (proveedor.sc_monto) {
                        montoSolicitud += parseFloat(proveedor.sc_monto) || 0;
                    }
                });
            }

            // Sumar montos de proveedores seleccionados en activos
            if (solicitud.conceptoActivo && Array.isArray(solicitud.conceptoActivo)) {
                solicitud.conceptoActivo.forEach(activo => {
                    if (activo.proveedorSeleccionado && activo.proveedorSeleccionado.sc_monto) {
                        montoSolicitud += parseFloat(activo.proveedorSeleccionado.sc_monto) || 0;
                    }
                });
            }

            // Actualizar estadísticas generales
            estadisticas.montoTotal += montoSolicitud;

            // Actualizar estadísticas por estatus
            const estatusActual = solicitud.estatusCompras || 'Sin estatus';
            estadisticas.solicitudesPorEstatus[estatusActual] =
                (estadisticas.solicitudesPorEstatus[estatusActual] || 0) + 1;
            estadisticas.montoPorEstatus[estatusActual] =
                (estadisticas.montoPorEstatus[estatusActual] || 0) + montoSolicitud;

            // Actualizar estadísticas por clasificación
            const clasificacionActual = solicitud.clasificacionCompras || 'Sin clasificación';
            estadisticas.solicitudesPorClasificacion[clasificacionActual] =
                (estadisticas.solicitudesPorClasificacion[clasificacionActual] || 0) + 1;
            estadisticas.montoPorClasificacion[clasificacionActual] =
                (estadisticas.montoPorClasificacion[clasificacionActual] || 0) + montoSolicitud;

            // Agregar monto calculado a la solicitud para uso en frontend
            solicitud.montoTotalCalculado = montoSolicitud;

            // Agregar contador de activos
            solicitud.totalActivos = solicitud.conceptoActivo ? solicitud.conceptoActivo.length : 0;

            // Agregar contador de proveedores
            solicitud.totalProveedores = solicitud.proveedores ? solicitud.proveedores.length : 0;
        });

        // Calcular promedio
        if (solicitudes.length > 0) {
            estadisticas.promedioPorSolicitud = estadisticas.montoTotal / solicitudes.length;
        }

        // Agregar estadísticas adicionales
        estadisticas.solicitudesPendientes = estadisticas.solicitudesPorEstatus['Pendiente'] || 0;
        estadisticas.solicitudesProceso = estadisticas.solicitudesPorEstatus['Proceso'] || 0;
        estadisticas.solicitudesAutorizadas = estadisticas.solicitudesPorEstatus['Autorizada'] || 0;
        estadisticas.solicitudesCompletadas = estadisticas.solicitudesPorEstatus['Completada'] || 0;
        estadisticas.solicitudesConProveedorSeleccionado = totalConProveedorSeleccionado;

        res.json({
            success: true,
            data: {
                solicitudes: solicitudes,
                estadisticas: estadisticas,
                filtrosAplicados: {
                    proveedor,
                    estatus,
                    dias,
                    tipoCompra,
                    clasificacion
                }
            }
        });

    } catch (error) {
        console.error('Error en bitácora de compras:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la bitácora de compras'
        });
    }
});

/*
// DESCARGAR REPORTE EXCEL DE BITÁCORA DE COMPRAS
router.get('/descargar-reporte', authMiddleware, async (req, res) => {
    try {
        const { proveedor, estatus, dias, tipoCompra, clasificacion } = req.query;

        // Reutilizar la misma lógica de filtrado de bitácora
        let filtro = {};

        if (proveedor) {
            filtro['proveedores'] = {
                $elemMatch: {
                    $or: [
                        { razonSocial: { $regex: proveedor, $options: 'i' } },
                        { nickname: { $regex: proveedor, $options: 'i' } }
                    ]
                }
            };
        }

        if (estatus) {
            filtro.estatusCompras = estatus;
        }

        if (clasificacion) {
            filtro.clasificacionCompras = clasificacion;
        }

        if (tipoCompra) {
            filtro['conceptoActivo.sc_cca_descripcion'] = { $regex: tipoCompra, $options: 'i' };
        }

        if (dias) {
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - parseInt(dias));
            filtro.fechaCreacion = { $gte: fechaLimite };
        }

        const solicitudes = await registroSolicitudCompra.find(filtro)
            .sort({ fechaCreacion: -1 })
            .lean();

        // Crear libro de Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Bitácora de Compras');

        // Configurar columnas
        worksheet.columns = [
            { header: 'ID Solicitud', key: 'id', width: 15 },
            { header: 'Fecha Creación', key: 'fechaCreacion', width: 20 },
            { header: 'Clasificación', key: 'clasificacion', width: 20 },
            { header: 'Descripción', key: 'descripcion', width: 30 },
            { header: 'Estatus', key: 'estatus', width: 15 },
            { header: 'Fecha Autorización', key: 'fechaAutorizacion', width: 20 },
            { header: 'Total Activos', key: 'totalActivos', width: 15 },
            { header: 'Total Proveedores', key: 'totalProveedores', width: 18 },
            { header: 'Monto Total', key: 'montoTotal', width: 15 },
            { header: 'Personal', key: 'personal', width: 25 },
            { header: 'Proveedores', key: 'proveedores', width: 30 },
            { header: 'Activos', key: 'activos', width: 40 }
        ];

        // Estilo para encabezados
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '4472C4' }
        };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // Agregar datos
        solicitudes.forEach(solicitud => {
            // Calcular monto total
            let montoTotal = 0;
            if (solicitud.proveedores) {
                solicitud.proveedores.forEach(p => {
                    montoTotal += parseFloat(p.sc_monto) || 0;
                });
            }

            if (solicitud.conceptoActivo) {
                solicitud.conceptoActivo.forEach(a => {
                    if (a.proveedorSeleccionado && a.proveedorSeleccionado.sc_monto) {
                        montoTotal += parseFloat(a.proveedorSeleccionado.sc_monto) || 0;
                    }
                });
            }

            // Formatear personal
            const personalStr = solicitud.personal
                ? solicitud.personal.map(p => `${p.nombre} ${p.aPaterno} ${p.aMaterno}`).join(', ')
                : '';

            // Formatear proveedores
            const proveedoresStr = solicitud.proveedores
                ? solicitud.proveedores.map(p => `${p.razonSocial || p.nickname} - $${p.sc_monto || 0}`).join('\n')
                : '';

            // Formatear activos
            const activosStr = solicitud.conceptoActivo
                ? solicitud.conceptoActivo.map(a => {
                    const proveedorSel = a.proveedorSeleccionado
                        ? ` (✓ ${a.proveedorSeleccionado.razonSocial || a.proveedorSeleccionado.nickname} - $${a.proveedorSeleccionado.sc_monto || 0})`
                        : '';
                    return `${a.sc_cca_descripcion}${proveedorSel}`;
                }).join('\n')
                : '';

            worksheet.addRow({
                id: solicitud.id,
                fechaCreacion: new Date(solicitud.fechaCreacion).toLocaleDateString('es-MX'),
                clasificacion: solicitud.clasificacionCompras,
                descripcion: solicitud.descripcionConceptoCompra,
                estatus: solicitud.estatusCompras,
                fechaAutorizacion: solicitud.fechaAutorizacion
                    ? new Date(solicitud.fechaAutorizacion).toLocaleDateString('es-MX')
                    : '',
                totalActivos: solicitud.conceptoActivo ? solicitud.conceptoActivo.length : 0,
                totalProveedores: solicitud.proveedores ? solicitud.proveedores.length : 0,
                montoTotal: `$${montoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
                personal: personalStr,
                proveedores: proveedoresStr,
                activos: activosStr
            });
        });

        // Agregar fila de totales
        if (solicitudes.length > 0) {
            const totalMonto = solicitudes.reduce((sum, s) => {
                let monto = 0;
                if (s.proveedores) {
                    s.proveedores.forEach(p => monto += parseFloat(p.sc_monto) || 0);
                }
                if (s.conceptoActivo) {
                    s.conceptoActivo.forEach(a => {
                        if (a.proveedorSeleccionado) {
                            monto += parseFloat(a.proveedorSeleccionado.sc_monto) || 0;
                        }
                    });
                }
                return sum + monto;
            }, 0);

            worksheet.addRow({});
            const totalRow = worksheet.addRow({
                id: 'TOTALES',
                montoTotal: `$${totalMonto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
                totalSolicitudes: solicitudes.length
            });
            totalRow.font = { bold: true };
            totalRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'F2F2F2' }
            };
        }

        // Configurar respuesta
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=bitacora-compras.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error al generar reporte Excel:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte Excel'
        });
    }
});*/

// OBTENER CLASIFICACIONES ÚNICAS PARA FILTRO
router.get('/clasificaciones', authMiddleware, async (req, res) => {
    try {
        const clasificaciones = await registroSolicitudCompra.distinct('clasificacionCompras');
        res.json({
            success: true,
            data: clasificaciones.filter(c => c) // Filtrar valores nulos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener clasificaciones'
        });
    }
});

// OBTENER PROVEEDORES ÚNICOS PARA AUTocompletado
router.get('/proveedores', authMiddleware, async (req, res) => {
    try {
        const { buscar } = req.query;
        let filtro = {};

        if (buscar) {
            filtro['proveedores'] = {
                $elemMatch: {
                    $or: [
                        { razonSocial: { $regex: buscar, $options: 'i' } },
                        { nickname: { $regex: buscar, $options: 'i' } }
                    ]
                }
            };
        }

        const solicitudes = await registroSolicitudCompra.find(filtro).limit(50).lean();

        // Extraer todos los proveedores únicos
        const proveedoresSet = new Set();
        solicitudes.forEach(solicitud => {
            if (solicitud.proveedores) {
                solicitud.proveedores.forEach(proveedor => {
                    const nombre = proveedor.razonSocial || proveedor.nickname;
                    if (nombre) {
                        proveedoresSet.add(nombre);
                    }
                });
            }
        });

        const proveedores = Array.from(proveedoresSet).sort();

        res.json({
            success: true,
            data: proveedores
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener proveedores'
        });
    }
});

// OBTENER TIPOS DE COMPRA ÚNICOS
router.get('/tipos-compra', authMiddleware, async (req, res) => {
    try {
        const tipos = await registroSolicitudCompra.distinct('conceptoActivo.sc_cca_descripcion');
        res.json({
            success: true,
            data: tipos.filter(t => t).sort() // Filtrar valores nulos y ordenar
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener tipos de compra'
        });
    }
});

// routes/routeBitacoraCompras.js - Función descargar-reporte MEJORADA
router.get('/descargar-reporte-mejorado', authMiddleware, async (req, res) => {
    try {
        const { proveedor, estatus, dias, tipoCompra, clasificacion } = req.query;
        
        // Reutilizar la misma lógica de filtrado de bitácora
        let filtro = {};
        
        if (proveedor) {
            filtro['proveedores'] = {
                $elemMatch: {
                    $or: [
                        { razonSocial: { $regex: proveedor, $options: 'i' } },
                        { nickname: { $regex: proveedor, $options: 'i' } }
                    ]
                }
            };
        }
        
        if (estatus) {
            filtro.estatusCompras = estatus;
        }
        
        if (clasificacion) {
            filtro.clasificacionCompras = clasificacion;
        }
        
        if (tipoCompra) {
            filtro['conceptoActivo.sc_cca_descripcion'] = { $regex: tipoCompra, $options: 'i' };
        }
        
        if (dias) {
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - parseInt(dias));
            filtro.fechaCreacion = { $gte: fechaLimite };
        }

        const solicitudes = await registroSolicitudCompra.find(filtro)
            .sort({ fechaCreacion: -1 })
            .lean();

        // Crear libro de Excel con estilo profesional
        const workbook = new ExcelJS.Workbook();
        
        // Configurar propiedades del documento
        workbook.creator = 'Sistema de Activos';
        workbook.lastModifiedBy = 'Sistema de Activos';
        workbook.created = new Date();
        workbook.modified = new Date();
        workbook.lastPrinted = new Date();

        // Hoja principal
        const worksheet = workbook.addWorksheet('Bitácora de Compras', {
            pageSetup: {
                paperSize: 9, // A4
                orientation: 'landscape',
                fitToPage: true,
                fitToWidth: 1,
                fitToHeight: 0
            },
            properties: {
                defaultRowHeight: 20,
                defaultColWidth: 15
            }
        });

        // ========== ESTILOS REUTILIZABLES ==========
        // Estilo para encabezados principales
        const headerStyle = {
            font: { 
                name: 'Calibri', 
                size: 11, 
                bold: true, 
                color: { argb: 'FFFFFF' } 
            },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '4472C4' } // Azul corporativo
            },
            alignment: { 
                vertical: 'middle', 
                horizontal: 'center',
                wrapText: true
            },
            border: {
                top: { style: 'thin', color: { argb: 'FFFFFF' } },
                left: { style: 'thin', color: { argb: 'FFFFFF' } },
                bottom: { style: 'thin', color: { argb: 'FFFFFF' } },
                right: { style: 'thin', color: { argb: 'FFFFFF' } }
            }
        };

        // Estilo para subtítulos
        const subHeaderStyle = {
            font: { 
                name: 'Calibri', 
                size: 10, 
                bold: true, 
                color: { argb: '000000' } 
            },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'D9E1F2' } // Azul claro
            },
            alignment: { 
                vertical: 'middle', 
                horizontal: 'center'
            },
            border: {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            }
        };

        // Estilo para datos normales
        const dataStyle = {
            font: { 
                name: 'Calibri', 
                size: 10, 
                color: { argb: '000000' } 
            },
            alignment: { 
                vertical: 'middle', 
                horizontal: 'left',
                wrapText: true
            },
            border: {
                top: { style: 'thin', color: { argb: 'A5A5A5' } },
                left: { style: 'thin', color: { argb: 'A5A5A5' } },
                bottom: { style: 'thin', color: { argb: 'A5A5A5' } },
                right: { style: 'thin', color: { argb: 'A5A5A5' } }
            }
        };

        // Estilo para montos (alineación derecha)
        const moneyStyle = {
            ...dataStyle,
            alignment: { 
                vertical: 'middle', 
                horizontal: 'right'
            },
            numFmt: '"$"#,##0.00'
        };

        // Estilo para fechas
        const dateStyle = {
            ...dataStyle,
            numFmt: 'dd/mm/yyyy'
        };

        // Estilo para estatus con colores
        const statusStyles = {
            'Pendiente': {
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2CC' } },
                font: { color: { argb: '7F6000' } }
            },
            'Proceso': {
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DDEBF7' } },
                font: { color: { argb: '2F5496' } }
            },
            'Autorizada': {
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6EFCE' } },
                font: { color: { argb: '006100' } }
            },
            'Cancelada': {
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCCC' } },
                font: { color: { argb: '9C0006' } }
            },
            'Completada': {
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' } },
                font: { color: { argb: '385723' } }
            }
        };

        // ========== TÍTULO Y METADATOS ==========
        // Título principal
        worksheet.mergeCells('A1:K1');
        const titleRow = worksheet.getRow(1);
        titleRow.height = 30;
        const titleCell = titleRow.getCell(1);
        titleCell.value = '📋 BITÁCORA DE SOLICITUDES DE COMPRA';
        titleCell.style = {
            font: { 
                name: 'Calibri', 
                size: 16, 
                bold: true, 
                color: { argb: '1F4E78' } 
            },
            alignment: { 
                vertical: 'middle', 
                horizontal: 'center'
            },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'D0CECE' }
            }
        };

        // Filtros aplicados
        worksheet.mergeCells('A2:K2');
        const filterRow = worksheet.getRow(2);
        const filterCell = filterRow.getCell(1);
        
        let filtrosTexto = 'Filtros aplicados: ';
        if (proveedor) filtrosTexto += `Proveedor: ${proveedor} | `;
        if (estatus) filtrosTexto += `Estatus: ${estatus} | `;
        if (dias) filtrosTexto += `Periodo: Últimos ${dias} días | `;
        if (tipoCompra) filtrosTexto += `Tipo: ${tipoCompra} | `;
        if (clasificacion) filtrosTexto += `Clasificación: ${clasificacion} | `;
        
        filterCell.value = filtrosTexto.slice(0, -3) || 'Filtros: Todos los registros';
        filterCell.style = {
            font: { 
                name: 'Calibri', 
                size: 9, 
                italic: true, 
                color: { argb: '7F7F7F' } 
            },
            alignment: { vertical: 'middle', horizontal: 'left' }
        };

        // Fecha de generación
        worksheet.mergeCells('A3:K3');
        const dateRow = worksheet.getRow(3);
        const dateCell = dateRow.getCell(1);
        dateCell.value = `Generado el: ${new Date().toLocaleDateString('es-MX', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}`;
        dateCell.style = {
            font: { 
                name: 'Calibri', 
                size: 9, 
                color: { argb: '7F7F7F' } 
            },
            alignment: { vertical: 'middle', horizontal: 'right' }
        };

        // Espacio
        worksheet.getRow(4).height = 5;

        // ========== ENCABEZADOS DE COLUMNAS ==========
        const headers = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'FECHA CREACIÓN', key: 'fechaCreacion', width: 12 },
            { header: 'CLASIFICACIÓN', key: 'clasificacion', width: 15 },
            { header: 'DESCRIPCIÓN', key: 'descripcion', width: 25 },
            { header: 'ESTATUS', key: 'estatus', width: 12 },
            { header: 'PERSONAL', key: 'personal', width: 20 },
            { header: 'PROVEEDORES DISPONIBLES', key: 'proveedores', width: 25 },
            { header: 'ACTIVOS SOLICITADOS', key: 'activos', width: 30 },
            { header: 'PROVEEDOR SELECCIONADO', key: 'proveedorSeleccionado', width: 25 },
            { header: 'MONTO SELEC./PROM.', key: 'monto', width: 15 },
            { header: 'OBSERVACIONES', key: 'observaciones', width: 20 }
        ];

        worksheet.columns = headers;

        // Aplicar estilo a encabezados
        const headerRow = worksheet.getRow(5);
        headerRow.height = 25;
        headers.forEach((header, index) => {
            const cell = headerRow.getCell(index + 1);
            cell.value = header.header;
            cell.style = headerStyle;
        });

        // ========== DATOS DE SOLICITUDES ==========
        let rowIndex = 6;
        let montoTotalSeleccionado = 0;
        let montoTotalPromedio = 0;

        solicitudes.forEach((solicitud, idx) => {
            const row = worksheet.getRow(rowIndex);
            
            // Calcular montos
            let montoSeleccionado = 0;
            let montoPromedio = 0;
            let proveedorSeleccionado = '';
            let tieneProveedorSeleccionado = false;

            // Calcular promedio de proveedores
            if (solicitud.proveedores && solicitud.proveedores.length > 0) {
                const sumaMontos = solicitud.proveedores.reduce((sum, p) => {
                    return sum + (parseFloat(p.sc_monto) || 0);
                }, 0);
                montoPromedio = sumaMontos / solicitud.proveedores.length;
            }

            // Verificar proveedor seleccionado
            if (solicitud.conceptoActivo) {
                solicitud.conceptoActivo.forEach(activo => {
                    if (activo.proveedorSeleccionado) {
                        montoSeleccionado += parseFloat(activo.proveedorSeleccionado.sc_monto) || 0;
                        if (activo.proveedorSeleccionado.razonSocial || activo.proveedorSeleccionado.nickname) {
                            proveedorSeleccionado = activo.proveedorSeleccionado.razonSocial || 
                                                   activo.proveedorSeleccionado.nickname;
                            tieneProveedorSeleccionado = true;
                        }
                    }
                });
            }

            // Determinar qué monto mostrar
            const montoAMostrar = tieneProveedorSeleccionado ? montoSeleccionado : montoPromedio;
            const tipoMonto = tieneProveedorSeleccionado ? 'Seleccionado' : 'Promedio';
            
            if (tieneProveedorSeleccionado) {
                montoTotalSeleccionado += montoSeleccionado;
            } else {
                montoTotalPromedio += montoPromedio;
            }

            // Formatear personal
            const personalStr = solicitud.personal && solicitud.personal.length > 0 
                ? solicitud.personal.map(p => `${p.nombre} ${p.aPaterno}`).join(', ')
                : 'Sin personal';

            // Formatear proveedores disponibles
            const proveedoresStr = solicitud.proveedores && solicitud.proveedores.length > 0 
                ? solicitud.proveedores.map(p => 
                    `${p.razonSocial || p.nickname}: $${(p.sc_monto || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                ).join('\n')
                : 'Sin proveedores';

            // Formatear activos con proveedor seleccionado
            const activosStr = solicitud.conceptoActivo && solicitud.conceptoActivo.length > 0
                ? solicitud.conceptoActivo.map((activo, idx) => {
                    const proveedorSel = activo.proveedorSeleccionado 
                        ? `\n  ✓ ${activo.proveedorSeleccionado.razonSocial || activo.proveedorSeleccionado.nickname} - $${(activo.proveedorSeleccionado.sc_monto || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                        : '\n  ○ Pendiente de selección';
                    return `${idx + 1}. ${activo.sc_cca_descripcion || 'Sin descripción'}${proveedorSel}`;
                }).join('\n')
                : 'Sin activos';

            // Observaciones
            const observaciones = tieneProveedorSeleccionado 
                ? 'Proveedor seleccionado ✓'
                : solicitud.proveedores && solicitud.proveedores.length > 0
                    ? `Promedio de ${solicitud.proveedores.length} proveedores`
                    : 'Sin proveedores registrados';

            // Llenar datos de la fila
            row.getCell(1).value = solicitud.id;
            row.getCell(2).value = new Date(solicitud.fechaCreacion);
            row.getCell(3).value = solicitud.clasificacionCompras || 'Sin clasificación';
            row.getCell(4).value = solicitud.descripcionConceptoCompra || 'Sin descripción';
            row.getCell(5).value = solicitud.estatusCompras || 'Sin estatus';
            row.getCell(6).value = personalStr;
            row.getCell(7).value = proveedoresStr;
            row.getCell(8).value = activosStr;
            row.getCell(9).value = proveedorSeleccionado || 'Pendiente';
            row.getCell(10).value = montoAMostrar;
            row.getCell(11).value = observaciones;

            // Aplicar estilos a las celdas
            row.getCell(1).style = { ...dataStyle, alignment: { horizontal: 'center' } };
            row.getCell(2).style = dateStyle;
            row.getCell(3).style = dataStyle;
            row.getCell(4).style = dataStyle;
            
            // Estilo especial para estatus con colores
            const estatusCell = row.getCell(5);
            estatusCell.style = {
                ...dataStyle,
                alignment: { horizontal: 'center' },
                font: { bold: true }
            };
            
            const estatusStyle = statusStyles[solicitud.estatusCompras];
            if (estatusStyle) {
                estatusCell.style = { ...estatusCell.style, ...estatusStyle };
            }
            
            row.getCell(6).style = dataStyle;
            row.getCell(7).style = dataStyle;
            row.getCell(8).style = dataStyle;
            row.getCell(9).style = { 
                ...dataStyle, 
                font: { 
                    ...dataStyle.font, 
                    bold: tieneProveedorSeleccionado, 
                    color: { argb: tieneProveedorSeleccionado ? '006100' : '7F6000' } 
                } 
            };
            row.getCell(10).style = moneyStyle;
            row.getCell(11).style = { 
                ...dataStyle, 
                font: { 
                    italic: true, 
                    size: 9, 
                    color: { argb: tieneProveedorSeleccionado ? '006100' : '7F6000' } 
                } 
            };

            // Alternar colores de fila para mejor legibilidad
            if (idx % 2 === 0) {
                for (let i = 1; i <= 11; i++) {
                    const cell = row.getCell(i);
                    if (!cell.style.fill) {
                        cell.style.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'F9F9F9' }
                        };
                    }
                }
            }

            // Ajustar altura de fila automáticamente
            row.height = 'auto';

            rowIndex++;
        });

        // ========== RESUMEN Y TOTALES ==========
        // Espacio
        worksheet.getRow(rowIndex).height = 10;
        rowIndex++;

        // Encabezado de resumen
        worksheet.mergeCells(`A${rowIndex}:K${rowIndex}`);
        const summaryHeader = worksheet.getRow(rowIndex);
        summaryHeader.height = 25;
        const summaryHeaderCell = summaryHeader.getCell(1);
        summaryHeaderCell.value = '📊 RESUMEN ESTADÍSTICO';
        summaryHeaderCell.style = {
            font: { 
                name: 'Calibri', 
                size: 12, 
                bold: true, 
                color: { argb: '1F4E78' } 
            },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'E2EFDA' }
            },
            alignment: { vertical: 'middle', horizontal: 'center' },
            border: {
                top: { style: 'medium', color: { argb: '4472C4' } },
                left: { style: 'medium', color: { argb: '4472C4' } },
                bottom: { style: 'medium', color: { argb: '4472C4' } },
                right: { style: 'medium', color: { argb: '4472C4' } }
            }
        };
        rowIndex++;

        // Datos del resumen
        const summaryData = [
            ['Total de Solicitudes:', solicitudes.length, ''],
            ['Con Proveedor Seleccionado:', solicitudes.filter(s => {
                return s.conceptoActivo?.some(a => a.proveedorSeleccionado);
            }).length, ''],
            ['Monto Total Seleccionado:', montoTotalSeleccionado, ''],
            ['Monto Total en Promedio:', montoTotalPromedio, ''],
            ['Monto Total General:', montoTotalSeleccionado + montoTotalPromedio, ''],
            ['Promedio por Solicitud:', (montoTotalSeleccionado + montoTotalPromedio) / (solicitudes.length || 1), '']
        ];

        summaryData.forEach((data, idx) => {
            const row = worksheet.getRow(rowIndex);
            worksheet.mergeCells(`A${rowIndex}:C${rowIndex}`);
            const cell1 = row.getCell(1);
            cell1.value = data[0];
            cell1.style = {
                font: { name: 'Calibri', size: 10, bold: true },
                alignment: { horizontal: 'right' },
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: idx % 2 === 0 ? 'F2F2F2' : 'FFFFFF' }
                }
            };

            const cell2 = row.getCell(4);
            cell2.value = idx >= 2 ? data[1] : data[1]; // Los primeros dos son números, los demás montos
            cell2.style = {
                font: { name: 'Calibri', size: 10, bold: idx >= 2 },
                alignment: { horizontal: idx >= 2 ? 'right' : 'center' },
                numFmt: idx >= 2 ? '"$"#,##0.00' : '0',
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: idx % 2 === 0 ? 'F2F2F2' : 'FFFFFF' }
                }
            };

            rowIndex++;
        });

        // ========== PIE DE PÁGINA ==========
        worksheet.mergeCells(`A${rowIndex}:K${rowIndex}`);
        const footerRow = worksheet.getRow(rowIndex);
        footerRow.height = 20;
        const footerCell = footerRow.getCell(1);
        footerCell.value = '📄 Este reporte fue generado automáticamente por el Sistema de Gestión de Activos';
        footerCell.style = {
            font: { 
                name: 'Calibri', 
                size: 8, 
                italic: true, 
                color: { argb: '7F7F7F' } 
            },
            alignment: { vertical: 'middle', horizontal: 'center' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'F2F2F2' }
            }
        };

        // ========== CONGELAR PANELES ==========
        worksheet.views = [
            {
                state: 'frozen',
                xSplit: 0,
                ySplit: 5, // Congela los primeros 5 renglones (título y encabezados)
                activeCell: 'A6'
            }
        ];

        // ========== AUTO-FILTROS ==========
        worksheet.autoFilter = {
            from: { row: 5, column: 1 },
            to: { row: 5 + solicitudes.length, column: 11 }
        };

        // ========== AJUSTAR ANCHO DE COLUMNAS AUTOMÁTICAMENTE ==========
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const columnLength = cell.value ? cell.value.toString().length : 0;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = Math.min(Math.max(maxLength + 2, column.width || 0), 50);
        });

        // Configurar respuesta
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=bitacora-compras-${new Date().toISOString().split('T')[0]}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error al generar reporte Excel mejorado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte Excel'
        });
    }
});

module.exports = router;