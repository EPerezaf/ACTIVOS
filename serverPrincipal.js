const express = require('express');
const mongosee = require('mongoose');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

//CONEXION A MONGODB
mongosee.connect('mongodb://127.0.0.1:27017/ActivosForm')
    .then(() => console.log('Conectando a MongoDB'))
    .catch(err => console.error('Error de conexion:', err));


//MIDDLEAWERS
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//SERVIR TODOS LOS HTMLS AUTOMATICAMENTE
const htmlDir = path.join(__dirname, 'public', 'html');

//SERVIR PAGINA PRINCIPAL
app.get('/', (req,res) => {
    res.sendFile(path.join(htmlDir, 'index.html'));
});

app.get('/:page.html', (req,res) =>{
    const pageName = req.params.page;
    const filePath = path.join(htmlDir, `${pageName}.html`);

    //VERIFICAR SI EXISTE EL ARCHIVO
    if(fs.existsSync(filePath)){
        res.sendFile(filePath);
    }else{
        res.status(404).send('Pagina no encontrada');
    }
});

const familiasRoutes = require('./routes/familia');
const subFamiliaRoutes = require('./routes/routeSubFamilia');
const conceptoActivosRoutes = require('./routes/routeConceptoActivos');
const conceptoGastoRoutes = require('./routes/routeConceptoGasto');
const personalRoutes = require('./routes/routePersonal');
const conceptoCompraRoute = require('./routes/routeConceptoCompra');
const solicitudCompraRoute = require('./routes/routeSolicitudCompra');
const proveedorRoute = require('./routes/routeProveedor');
const listaSolicitudCompraRoute = require('./routes/routeListaSolicitudCompra');
const listaFamiliaRoute = require('./routes/routeListaFamilia');
const listaSubFamiliaRoute = require('./routes/routeListaSubFamilia');
const { json } = require('stream/consumers');

//USAR RUTAS CON PREFIJOS
app.use('/api/familia', familiasRoutes);
app.use('/api/routeSubFamilia', subFamiliaRoutes);
app.use('/api/routeConceptoActivos', conceptoActivosRoutes);
app.use('/api/routeConceptoGasto', conceptoGastoRoutes);
app.use('/api/routePersonal', personalRoutes);
app.use('/api/routeConceptoCompra', conceptoCompraRoute);
app.use('/api/routeSolicitudCompra', solicitudCompraRoute);
app.use('/api/routeProveedor', proveedorRoute);
app.use('/api/routeListaSolicitudCompra',listaSolicitudCompraRoute);
app.use('/api/routeListaFamilia', listaFamiliaRoute);
app.use('/api/routeListaSubFamilia', listaSubFamiliaRoute);

app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});