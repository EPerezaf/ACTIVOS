const express = require("express");
const router = express.Router();
const registroSolicitudGasto = require("../models/modelSolicitudGasto");
const registroActivo = require("../models/modelRegistroActivo"); // Asegúrate de tener este modelo
const authMiddleware = require("../middleware/authMiddleware");
const ExcelJS = require('exceljs');

// OBTENER LISTA DE ACTIVOS PARA AUTocompletado (MEJORADA)
router.get("/activos", authMiddleware, async (req, res) => {
    try {
        const activos = await registroActivo.find({})
            .select('conceptoActivo familia subFamilia nomenclatura numSerie')
            .sort({ conceptoActivo: 1 })
            .limit(1000);

        // Filtrar solo activos con conceptoActivo válido
        const activosFiltrados = activos.filter(activo => 
            activo && 
            activo.conceptoActivo && 
            typeof activo.conceptoActivo === 'string' &&
            activo.conceptoActivo.trim() !== ''
        );

        console.log(`📋 Activos encontrados: ${activos.length}, Válidos: ${activosFiltrados.length}`);

        res.json({
            success: true,
            data: activosFiltrados,
            total: activosFiltrados.length,
            originalCount: activos.length,
            filteredCount: activosFiltrados.length
        });

    } catch (error) {
        console.error("❌ Error al obtener activos:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener la lista de activos"
        });
    }
});

// OBTENER BITÁCORA DE GASTOS (optimizada para búsqueda específica)
router.get("/bitacora", authMiddleware, async (req, res) => {
    try {
        const { activo, estatus, dias } = req.query;
        
        console.log('🔍 Filtros bitácora:', { activo, estatus, dias });

        // CONSTRUIR FILTRO
        let filtro = {};
        
        if (activo && activo !== '') {
            filtro['activos.conceptoActivo'] = activo; // Búsqueda exacta para activos específicos
        }
        
        if (estatus && estatus !== '') {
            filtro.estatusCompras = estatus;
        }
        
        if (dias && dias !== '') {
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - parseInt(dias));
            filtro.fechaCreacion = { $gte: fechaLimite };
        }

        console.log('📊 Filtro aplicado:', filtro);

        // BUSCAR SOLICITUDES QUE COINCIDAN
        const solicitudes = await registroSolicitudGasto.find(filtro)
            .sort({ fechaCreacion: -1 });

        // PROCESAR DATOS PARA LA BITÁCORA
        const gastos = [];
        const activosUnicos = new Set();
        let montoTotal = 0;

        solicitudes.forEach(solicitud => {
            if (solicitud.activos && Array.isArray(solicitud.activos)) {
                solicitud.activos.forEach(activo => {
                    if (!activo || !activo.conceptoActivo) return;
                    
                    const monto = (activo.proveedorSeleccionado && activo.proveedorSeleccionado.monto) ? 
                        parseFloat(activo.proveedorSeleccionado.monto) : 0;

                    const gasto = {
                        solicitudId: solicitud.id,
                        activo: {
                            conceptoActivo: activo.conceptoActivo,
                            familia: activo.familia,
                            subFamilia: activo.subFamilia,
                            nomenclatura: activo.nomenclatura,
                            numSerie: activo.numSerie
                        },
                        conceptoGasto: activo.conceptoGasto,
                        proveedorSeleccionado: activo.proveedorSeleccionado,
                        monto: monto,
                        estatus: solicitud.estatusCompras,
                        fechaCreacion: solicitud.fechaCreacion,
                        tipoGasto: solicitud.tipoGasto,
                        clasificacion: solicitud.clasificacionGasto,
                        descripcion: solicitud.descripcionGasto
                    };

                    gastos.push(gasto);
                    activosUnicos.add(activo.conceptoActivo);
                    montoTotal += monto;
                });
            }
        });

        // CALCULAR ESTADÍSTICAS
        const estadisticas = {
            totalGastos: gastos.length,
            montoTotal: montoTotal,
            totalActivos: activosUnicos.size,
            promedioPorActivo: activosUnicos.size > 0 ? (montoTotal / activosUnicos.size) : 0,
            primerGasto: gastos.length > 0 ? gastos[gastos.length - 1].fechaCreacion : null,
            ultimoGasto: gastos.length > 0 ? gastos[0].fechaCreacion : null
        };

        res.json({
            success: true,
            data: {
                gastos: gastos,
                estadisticas: estadisticas
            },
            total: gastos.length
        });

    } catch (error) {
        console.error("❌ Error al obtener bitácora:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener la bitácora de gastos"
        });
    }
});

// DESCARGAR REPORTE EN EXCEL MEJORADO Y CORREGIDO
router.get("/descargar-reporte", authMiddleware, async (req, res) => {
    try {
        const { activo, estatus, dias } = req.query;

        // Mismo filtro que la bitácora
        let filtro = {};
        if (activo && activo !== '') {
            filtro['activos.conceptoActivo'] = activo;
        }
        if (estatus && estatus !== '') {
            filtro.estatusCompras = estatus;
        }
        if (dias && dias !== '') {
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - parseInt(dias));
            filtro.fechaCreacion = { $gte: fechaLimite };
        }

        const solicitudes = await registroSolicitudGasto.find(filtro)
            .sort({ fechaCreacion: -1 });

        // CREAR LIBRO DE EXCEL MEJORADO
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Sistema de Gestión de Activos';
        workbook.lastModifiedBy = 'Sistema';
        workbook.created = new Date();
        workbook.modified = new Date();
        
        // HOJA PRINCIPAL - BITÁCORA
        const worksheet = workbook.addWorksheet('Bitácora de Gastos', {
            views: [{ state: 'frozen', ySplit: 4 }] // Congelar encabezados
        });

        // ESTILOS REUTILIZABLES
        const headerStyle = {
            font: { bold: true, color: { argb: 'FFFFFF' }, size: 11 },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '2F75B5' } },
            alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
            border: {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            }
        };

        const titleStyle = {
            font: { bold: true, size: 16, color: { argb: 'FFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '2F75B5' } },
            alignment: { horizontal: 'center', vertical: 'middle' }
        };

        const dataStyle = {
            font: { size: 10 },
            border: {
                top: { style: 'thin', color: { argb: 'D3D3D3' } },
                left: { style: 'thin', color: { argb: 'D3D3D3' } },
                bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
                right: { style: 'thin', color: { argb: 'D3D3D3' } }
            }
        };

        // TÍTULO PRINCIPAL
        worksheet.mergeCells('A1:J1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'BITÁCORA DE GASTOS POR ACTIVO';
        Object.assign(titleCell, titleStyle);
        titleCell.border = {
            top: { style: 'thin', color: { argb: '000000' } },
            left: { style: 'thin', color: { argb: '000000' } },
            bottom: { style: 'thin', color: { argb: '000000' } },
            right: { style: 'thin', color: { argb: '000000' } }
        };

        // SUBTÍTULO - INFORMACIÓN DEL REPORTE
        worksheet.mergeCells('A2:J2');
        const subtitleCell = worksheet.getCell('A2');
        let filtroTexto = '';
        if (activo) filtroTexto += `Activo: ${activo} | `;
        if (estatus) filtroTexto += `Estatus: ${estatus} | `;
        if (dias) filtroTexto += `Periodo: Últimos ${dias} días | `;
        filtroTexto += `Generado: ${new Date().toLocaleDateString()}`;
        
        subtitleCell.value = filtroTexto;
        subtitleCell.font = { italic: true, size: 10, color: { argb: '666666' } };
        subtitleCell.alignment = { horizontal: 'center' };
        subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } };

        // ESPACIO EN BLANCO
        worksheet.getRow(3).height = 5;

        // ENCABEZADOS DE COLUMNAS
        const headers = [
            { header: 'ID SOLICITUD', key: 'solicitudId', width: 12 },
            { header: 'ACTIVO', key: 'activo', width: 25 },
            { header: 'FAMILIA', key: 'familia', width: 18 },
            { header: 'SUB FAMILIA', key: 'subFamilia', width: 18 },
            { header: 'CONCEPTO GASTO', key: 'conceptoGasto', width: 22 },
            { header: 'PROVEEDOR', key: 'proveedor', width: 25 },
            { header: 'MONTO', key: 'monto', width: 12 },
            { header: 'ESTATUS', key: 'estatus', width: 12 },
            { header: 'FECHA', key: 'fecha', width: 12 },
            { header: 'TIPO GASTO', key: 'tipoGasto', width: 15 }
        ];

        // DEFINIR COLUMNAS
        worksheet.columns = headers;

        // APLICAR ESTILO A ENCABEZADOS
        const headerRow = worksheet.getRow(4);
        headerRow.height = 25;
        
        headers.forEach((header, index) => {
            const cell = headerRow.getCell(index + 1);
            cell.value = header.header;
            Object.assign(cell, headerStyle);
        });

        // AGREGAR DATOS
        let rowNumber = 5;
        let totalMonto = 0;
        let totalGastos = 0;

        solicitudes.forEach(solicitud => {
            if (solicitud.activos && Array.isArray(solicitud.activos)) {
                solicitud.activos.forEach(activo => {
                    if (!activo || !activo.conceptoActivo) return;

                    const monto = activo.proveedorSeleccionado ? 
                        parseFloat(activo.proveedorSeleccionado.monto) || 0 : 0;
                    totalMonto += monto;
                    totalGastos++;

                    const rowData = {
                        solicitudId: solicitud.id || 'N/A',
                        activo: activo.conceptoActivo || 'Sin nombre',
                        familia: activo.familia || 'No especificada',
                        subFamilia: activo.subFamilia || 'No especificada',
                        conceptoGasto: activo.conceptoGasto || 'Sin concepto',
                        proveedor: activo.proveedorSeleccionado ? 
                            `${activo.proveedorSeleccionado.razonSocial || 'Sin nombre'} (${activo.proveedorSeleccionado.nickName || ''})` 
                            : 'No seleccionado',
                        monto: monto,
                        estatus: solicitud.estatusCompras || 'Desconocido',
                        fecha: solicitud.fechaCreacion ? 
                            new Date(solicitud.fechaCreacion).toISOString().split('T')[0] : 'N/A',
                        tipoGasto: solicitud.tipoGasto || 'No especificado'
                    };

                    const row = worksheet.addRow(rowData);
                    
                    // APLICAR ESTILO A FILAS DE DATOS
                    row.eachCell((cell, colNumber) => {
                        Object.assign(cell, dataStyle);
                        
                        // COLOR DE FONDO ALTERNADO
                        if (rowNumber % 2 === 0) {
                            cell.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: 'F8F9FA' }
                            };
                        }
                        
                        // ALINEACIÓN
                        if (colNumber === 7) { // Columna de monto
                            cell.alignment = { horizontal: 'right' };
                            cell.numFmt = '"$"#,##0.00';
                        } else if (colNumber === 1 || colNumber === 9) { // ID y Fecha
                            cell.alignment = { horizontal: 'center' };
                        } else {
                            cell.alignment = { horizontal: 'left', wrapText: true };
                        }
                        
                        // COLORES PARA ESTATUS
                        if (colNumber === 8) {
                            switch(rowData.estatus) {
                                case 'Autorizada':
                                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2F0D9' } };
                                    break;
                                case 'Pendiente':
                                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2CC' } };
                                    break;
                                case 'Proceso':
                                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DEEBF7' } };
                                    break;
                                case 'Cancelada':
                                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FCE4D6' } };
                                    break;
                            }
                        }
                    });

                    row.height = 20;
                    rowNumber++;
                });
            }
        });

        // FILA DE TOTALES
        if (totalGastos > 0) {
            const totalRow = worksheet.addRow({});
            totalRow.height = 25;
            
            // CELDA DE "TOTAL"
            const totalLabelCell = totalRow.getCell(1);
            totalLabelCell.value = 'TOTAL';
            totalLabelCell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
            totalLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '70AD47' } };
            totalLabelCell.alignment = { horizontal: 'center' };
            totalLabelCell.border = headerStyle.border;
            
            // CELDA DE MONTO TOTAL
            const totalMontoCell = totalRow.getCell(7);
            totalMontoCell.value = totalMonto;
            totalMontoCell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
            totalMontoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '70AD47' } };
            totalMontoCell.alignment = { horizontal: 'right' };
            totalMontoCell.numFmt = '"$"#,##0.00';
            totalMontoCell.border = headerStyle.border;
            
            // MERGE DE CELDAS RESTANTES
            for (let i = 2; i <= 6; i++) {
                const cell = totalRow.getCell(i);
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '70AD47' } };
                cell.border = headerStyle.border;
            }
            for (let i = 8; i <= 10; i++) {
                const cell = totalRow.getCell(i);
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '70AD47' } };
                cell.border = headerStyle.border;
            }
        }

        // HOJA DE RESUMEN
        const resumenSheet = workbook.addWorksheet('Resumen');

        // TÍTULO RESUMEN
        resumenSheet.mergeCells('A1:B1');
        const resumenTitle = resumenSheet.getCell('A1');
        resumenTitle.value = 'RESUMEN ESTADÍSTICO - BITÁCORA DE GASTOS';
        Object.assign(resumenTitle, titleStyle);

        // INFORMACIÓN DEL REPORTE EN RESUMEN
        resumenSheet.mergeCells('A2:B2');
        const resumenSubtitle = resumenSheet.getCell('A2');
        resumenSubtitle.value = filtroTexto;
        resumenSubtitle.font = { italic: true, size: 10, color: { argb: '666666' } };
        resumenSubtitle.alignment = { horizontal: 'center' };
        resumenSubtitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } };

        resumenSheet.getRow(3).height = 10;

        // ESTADÍSTICAS
        const estadisticas = [
            ['Total de Gastos Registrados', totalGastos],
            ['Monto Total', totalMonto],
            ['Total de Solicitudes', solicitudes.length],
            ['Activos con Gastos', new Set(solicitudes.flatMap(s => 
                s.activos ? s.activos.map(a => a.conceptoActivo) : []
            )).size],
            ['Primer Registro', solicitudes.length > 0 ? 
                new Date(solicitudes[solicitudes.length - 1].fechaCreacion).toLocaleDateString() : 'N/A'],
            ['Último Registro', solicitudes.length > 0 ? 
                new Date(solicitudes[0].fechaCreacion).toLocaleDateString() : 'N/A'],
            ['Promedio por Gasto', totalGastos > 0 ? totalMonto / totalGastos : 0]
        ];

        estadisticas.forEach(([label, value], index) => {
            const row = resumenSheet.getRow(index + 4);
            
            const labelCell = row.getCell(1);
            labelCell.value = label;
            labelCell.font = { bold: true };
            labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7E6E6' } };
            labelCell.border = dataStyle.border;
            labelCell.alignment = { horizontal: 'left', vertical: 'middle' };
            
            const valueCell = row.getCell(2);
            
            if (label.includes('Monto') || label.includes('Promedio')) {
                valueCell.value = value;
                valueCell.numFmt = '"$"#,##0.00';
            } else {
                valueCell.value = value;
            }
            
            valueCell.border = dataStyle.border;
            valueCell.alignment = { horizontal: 'right', vertical: 'middle' };
            
            row.height = 25;
        });

        // AJUSTAR ANCHO DE COLUMNAS EN RESUMEN
        resumenSheet.columns = [
            { width: 35 },
            { width: 20 }
        ];

        // CONFIGURAR RESPUESTA
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=bitacora-gastos-${new Date().toISOString().split('T')[0]}.xlsx`);

        // ESCRIBIR Y ENVIAR
        const buffer = await workbook.xlsx.writeBuffer();
        res.send(buffer);

    } catch (error) {
        console.error("❌ Error al generar reporte:", error);
        res.status(500).json({
            success: false,
            message: "Error al generar el reporte: " + error.message
        });
    }
});

module.exports = router;