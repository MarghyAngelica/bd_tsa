const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
var swig = require('swig')
var fs = require('fs')
const async = require('async')
var HttpsFunctions = require('./helpers/HttpsFunctions')
const Db = require('./controller/db')
const Hash = require('./helpers/Crypt')
const { v4: uuidv4 } = require('uuid');

var General = require('./helpers/general');
const { Console } = require('console');


var sFileConfig = fs.readFileSync('config.json', 'utf8')
global.__Config = JSON.parse(sFileConfig)
global.__General = new General()
global.__https = new HttpsFunctions()
global.__hash = new Hash()

// --conexión con base de datos Postgres - pgAdmin4
global.__Db = new Db(__Config.db)



//const { exception } = require('console');
const router = express.Router();
const app = express();

//app.use(timeout('3000s'))
app.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/views'));

//HTML render
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

/*
Old TSAProxy
*/

router.get('/byplans', __General.globalCatch(async (req, res) => {
    res.render('byplans', {});
}));

//Cola

const callbackQueue = (error) => {
    console.log('Error: ', error)
    if (error != null) {
        console.log('Error procesando el item')
        console.log('Error | ', error)
    } else {
        console.log('Procesado. Restantes en cola: ', queue.length())
    }
}

const queue = async.queue(__Db.insertDatos, 1);

queue.drain(() => {
    console.log('Termina cola DB')
})

//endpoint escritura de datos en la cola

router.post('/writeDatos', __General.globalCatch(async (req, res) => {
    let data = req.body
    var reqData = data.req
    var reqJson = JSON.parse(reqData)
    var ruta = `./Documentos/${data.id}-Res.txt`
    var datos = {
        id: data.id,
        fecha: data.fecha,
        metodo: data.metodo,
        endpoint: data.endpoint,
        status: data.status,
        req: data.req,
        res: data.res
    }
    switch (data.endpoint) {
        case '/logic/dian/validate_url':
            var dataUrl = reqJson.url
            var hashUrl = __hash.hash(dataUrl)
            reqJson.url = hashUrl
            const newReqDataUrl = JSON.stringify(reqJson)
            datos.req = newReqDataUrl
            if (datos.status == 500) {
                var resActual = JSON.parse(datos.res)
                const newResDataUrl = JSON.stringify(resActual)
                datos.res = newResDataUrl.replace(/'/g, '"')
            }
            queue.push(datos, callbackQueue)
            res.send({ datos: 'ok', success: true })
            break;
        case '/logic/dian/validate_nit':
            queue.push(datos, callbackQueue)
            res.send({ datos: 'ok', success: true })
            break;
        case '/logic/pdf/find':
            var dataFind = reqJson.b64
            var hashFind = __hash.hash(dataFind)
            reqJson.b64 = hashFind
            const newReqDataFind = JSON.stringify(reqJson)
            datos.req = newReqDataFind
            if (datos.status == 500) {
                var dataDoc = JSON.stringify(newReqDataFind)
                fs.writeFileSync(ruta, dataDoc)
            }
            queue.push(datos, callbackQueue)
            res.send({ datos: 'ok', success: true })
            break;
        case '/logic/pdf/extract':
            var dataPdfE = reqJson.b64
            var hashPdfE = __hash.hash(dataPdfE)
            reqJson.b64 = hashPdfE
            const newReqDataPdfExtract = JSON.stringify(reqJson)
            datos.req = newReqDataPdfExtract
            if (datos.status == 500) {
                var dataDoc = JSON.stringify(newReqDataPdfExtract)
                fs.writeFileSync(ruta, dataDoc)
            }
            queue.push(datos, callbackQueue)
            res.send({ datos: 'ok', success: true })
            break;
        case '/logic/pdf/417':
            var dataPdf417 = reqJson.b64
            var hashPdf417 = __hash.hash(dataPdf417)
            reqJson.b64 = hashPdf417
            const newReqDataPdf417 = JSON.stringify(reqJson)
            datos.req = newReqDataPdf417
            if (datos.status == 500) {
                var dataDoc = JSON.stringify(newReqDataPdf417)
                fs.writeFileSync(ruta, dataDoc)
            }
            queue.push(datos, callbackQueue)
            res.send({ datos: 'ok', success: true })
            break;
        case '/logic/utils/extract_cedula':
            var dataPdfCedula = reqJson.b64
            var hashPdfCedula = __hash.hash(dataPdfCedula)
            reqJson.b64 = hashPdfCedula
            const newReqDataPdfCedula = JSON.stringify(reqJson)
            datos.req = newReqDataPdfCedula
            if (datos.status == 500) {
                var dataDoc = JSON.stringify(newReqDataPdfCedula)
                fs.writeFileSync(ruta, dataDoc)
            }
            queue.push(datos, callbackQueue)
            res.send({ datos: 'ok', success: true })
            break;
        case '/logic/camara/validatePdf':
            var dataPdfCamara = reqJson.b64
            var hashPdfCamara = __hash.hash(dataPdfCamara)
            reqJson.b64 = hashPdfCamara
            const newReqDataPdfCamara = JSON.stringify(reqJson)
            datos.req = newReqDataPdfCamara
            if (datos.status == 500) {
                var dataDoc = JSON.stringify(newReqDataPdfCamara)
                fs.writeFileSync(ruta, dataDoc)
            }
            queue.push(datos, callbackQueue)
            res.send({ datos: 'ok', success: true })
            break;
        case 'http://127.0.0.1:5065/cedula/extract':
            var dataPdfCedulabarcode = reqJson.b64
            var hashPdfCedulabarcode = __hash.hash(dataPdfCedulabarcode)
            reqJson.b64 = hashPdfCedulabarcode
            const newReqDataPdfCedulabarcode = JSON.stringify(reqJson)
            datos.req = newReqDataPdfCedulabarcode
            if (datos.status == 500) {
                var dataDoc = JSON.stringify(newReqDataPdfCedulabarcode)
                fs.writeFileSync(ruta, dataDoc)
            }
            queue.push(datos, callbackQueue)
            res.send({ datos: 'ok', success: true })
            break;       
        case '/logic/dian/rut_extract':
            var datapdfRutExtract = reqJson.pdf
            var hashpdfRutExtract = __hash.hash(datapdfRutExtract)
            reqJson.pdf = hashpdfRutExtract
            const newReqDatapdfRutExtract = JSON.stringify(reqJson)
            datos.req = newReqDatapdfRutExtract
            if (datos.status == 500) {
                var dataDoc = JSON.stringify(newReqDatapdfRutExtract)
                fs.writeFileSync(ruta, dataDoc)
            }
            queue.push(datos, callbackQueue)
            res.send({ datos: 'ok', success: true })
            break;
        case '/v1/microOCR/pdfCedulaExtractor':
            var datapdfCedulaExtrac = reqJson.pdf
            var hashpdfCedulaExtrac = __hash.hash(datapdfCedulaExtrac)
            reqJson.pdf = hashpdfCedulaExtrac
            const newReqDatapdfCedulaExtrac = JSON.stringify(reqJson)
            datos.req = newReqDatapdfCedulaExtrac
            if (datos.status == 500) {
                var dataDoc = JSON.stringify(newReqDatapdfCedulaExtrac)
                fs.writeFileSync(ruta, dataDoc)
            }
            queue.push(datos, callbackQueue)
            res.send({ datos: 'ok', success: true })
            break;
        case '/v1/auth/login':
            queue.push(datos, callbackQueue)
            res.send({ datos: 'ok', success: true })
            break;
        case '/newocr/logic/dian/pdfExtractorRut':
            var datapdfExtracRutDep = reqJson.pdf
            var hashpdfExtracRutDep = __hash.hash(datapdfExtracRutDep)
            reqJson.pdf = hashpdfExtracRutDep
            const newReqDatapdfExtracRutDep = JSON.stringify(reqJson)
            datos.req = newReqDatapdfExtracRutDep
            if (datos.status == 500) {
                var dataDoc = JSON.stringify(newReqDatapdfExtracRutDep)
                fs.writeFileSync(ruta, dataDoc)
            }
            queue.push(datos, callbackQueue)
            res.send({ datos: 'ok', success: true })
            break;

        default:
            queue.push(datos, callbackQueue)
            res.send({ datos: 'ok', success: true })
            break;

    }   
}))

// endpoint solicitud lectura de datos

router.post('/readDatos', __General.globalCatch(async (req, res) => {
    const data = await __Db.obtenerLogs(req.body)
    res.send(data)
}))

app.use('/', router);
app.listen(__Config.puerto, () => {
    console.log(`App Started on PORT ${__Config.puerto}`);
});



