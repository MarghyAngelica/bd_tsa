class General {
    constructor() {

    }

    getAmbiente(ambiente) {
        if (!ambiente) {
            ambiente = "qa"
        }
        return ambiente
    }


    globalCatch(handler) {
        return async (req, res, next) => {
            try {
                await handler(req, res);
            } catch (e) {
                console.log(e.message + " - " + e.stack)
                res.status(500);
                res.send({
                    success: false,
                    mensaje: e.message
                });
            }
        };
    }


    convertToCSV(objArray) {
        const array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
        let str = "";
        let val
        for (let i = 0; i < array.length; i++) {
            let line = "";
            for (let index in array[i]) {
                val = array[i][index]
                if (index == "associatedDate") {//convertir a hora colombiana
                    try {
                        var fecha = new Date(array[i][index])
                        var nuevaFecha = new Date(fecha - 18000000)
                        val = nuevaFecha.toISOString()
                    } catch (e) {

                    }
                }
                if (line != "") line += ";";
                line += val;
            }
            str += line + "\r\n";
        }
        return str;
    }


    generarCortesMensuales(fechaInicio, fechaFinal) {
        console.log('Fecha inicio cortes: ', fechaInicio)
        var cortes = [];
        var cantidadCortes = (fechaFinal.getUTCMonth() - fechaInicio.getUTCMonth()) + 1
        cantidadCortes += (fechaFinal.getUTCFullYear() - fechaInicio.getUTCFullYear()) * 12
        var inicio;
        var final;
        var control = new Date(fechaInicio)
        for (let index = 0; index < cantidadCortes; index++) {
            inicio = new Date(control)
            control.setUTCDate(1)
            control.setUTCMonth(inicio.getUTCMonth() + 1)
            final = new Date(control)
            final.setUTCDate(0)
            if (index == cantidadCortes - 1) {
                final = new Date(fechaFinal)
            }
            cortes.push({
                ini: inicio,
                fin: final
            });
        }
        return cortes;

    }

    generarCortesQuincenales(fechaInicio, fechaFin) {
        var cortes = [];
        var cantidadCortes = (fechaFin.getUTCMonth() - fechaInicio.getUTCMonth()) + 1
        cantidadCortes += (fechaFin.getUTCFullYear() - fechaInicio.getUTCFullYear()) * 12
        cantidadCortes = cantidadCortes * 2;
        var bandera = true;
        if (fechaInicio.getUTCDate() > 15) {
            cantidadCortes--;
            bandera = false;
        }
        if (fechaFin.getUTCDate() < 15) {
            cantidadCortes--
        }
        var control = new Date(fechaInicio);
        var inicio
        var final
        for (let index = 0; index < cantidadCortes; index++) {
            if (bandera) {
                inicio = new Date(control)
                control.setUTCDate(16)
                final = new Date(control)
                final.setUTCDate(15)
                bandera = false;
            } else {
                inicio = new Date(control)
                control.setUTCDate(1)
                control.setUTCMonth(inicio.getUTCMonth() + 1)
                final = new Date(control)
                final.setUTCDate(0)
                bandera = true;
            }
            if (index == cantidadCortes - 1) {
                final = new Date(fechaFin)
            }
            cortes.push({
                ini: inicio,
                fin: final
            })
        }
        return cortes;
    }


    generarCortesDiarios(fechaInicio, fechaFin) {
        console.log('Fecha inicio cortes Diarios: ', fechaInicio)
        var cortes = [];
        var dia = new Date(fechaInicio);
        var registro
        while (dia <= fechaFin) {
            registro = new Date(dia)
            cortes.push({
                ini: registro,
                fin: registro
            })
            dia.setUTCDate(dia.getUTCDate() + 1)
        }
        return cortes;
    }


    generarCortes(fechaInicio, fechaFin, corte) {
        var cortes;
        switch (corte) {
            case "dia":
                cortes = this.generarCortesDiarios(fechaInicio, fechaFin)
                break;

            case "quincenal":
                cortes = this.generarCortesQuincenales(fechaInicio, fechaFin)
                break;
            case "mes":
                cortes = this.generarCortesMensuales(fechaInicio, fechaFin)
                break;
        }
        return cortes;
    }


    later(delay) {
        return new Promise(function (resolve) {
            setTimeout(resolve, delay);
        });
    }


    sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    }

    filtrarPlanes(planes) {
        var newPlans = {}
        for (var a = 0; a < planes.length; a++) {
            if (!newPlans[planes[a].from]) {
                newPlans[planes[a].from] = planes[a]
            } else if (newPlans[planes[a].from].units < planes[a].units) {
                newPlans[planes[a].from] = planes[a]
            }
        }
        return Object.values(newPlans);
    }
    formatDate(f) {
        f = new Date(f)
        return f.getFullYear() + "/" +
            (f.getMonth() + 1).toString().padStart(2, '0') + "/" +
            f.getDate().toString().padStart(2, '0');
    }
}


module.exports = General

