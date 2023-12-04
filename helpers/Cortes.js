class Cortes {
    constructor() {

    }
    generar(corte, fi, ff) {
        switch (corte) {
            case "dia":
                return this.diario(fi,ff)
            case "mes":
                return this.mensual(fi,ff)
            default:
                return []
        }
    }
    mensual(fi, ff) {
        var cortes = [];
        var inicio;
        var final;
        var control = new Date(fi)
        while (control < ff) {
            inicio = new Date(control)
            control.setDate(1)
            control.setMonth(inicio.getMonth() + 1)

            control.setHours(0)
            control.setMinutes(0)
            control.setSeconds(0)
            control.setMilliseconds(0)

            final = new Date(control)
            //final.setDate()

            final.setHours(23)
            final.setMinutes(59)
            final.setSeconds(59)
            final.setMilliseconds(999)
            final.setDate(0)

            cortes.push({
                ini: inicio,
                fin: final
            });
        }
        return cortes;
    }
    diario(fi, ff) {
        var cortes = [];
        var fiNoHora = new Date(fi)
        fiNoHora.setHours(0)
        fiNoHora.setMinutes(0)
        fiNoHora.setSeconds(0)
        fiNoHora.setMilliseconds(0)

        var ffNoHora = new Date(ff)
        ffNoHora.setHours(23)
        ffNoHora.setMinutes(59)
        ffNoHora.setSeconds(59)
        ffNoHora.setMilliseconds(999)

        var ini
        var fin
        var corte
        var count = 0
        while (fiNoHora <= ffNoHora) {
            count++
            ini = new Date(fiNoHora)
            fin = new Date(fiNoHora)


            fin.setHours(23)
            fin.setMinutes(59)
            fin.setSeconds(59)
            fin.setMilliseconds(999)

            if (count == 1) {
                ini.setHours(fi.getHours())
                ini.setMinutes(fi.getMinutes())
                ini.setSeconds(fi.getSeconds())
                ini.setMilliseconds(fi.getMilliseconds())
            }

            fiNoHora.setDate(fiNoHora.getDate() + 1)

            if (fiNoHora > ffNoHora) {
                fin.setHours(ff.getHours())
                fin.setMinutes(ff.getMinutes())
                fin.setSeconds(ff.getSeconds())
                fin.setMilliseconds(ff.getMilliseconds())
            }

            /*if (ini.toISOString() == fin.toISOString()) //Se usa el string ya que dos fechas iguales como objetos no se validaban como iguales
                continue*/

            corte = {
                ini: ini,
                fin: fin
            }
            cortes.push(corte)
        }
        return cortes;
    }
}
module.exports = Cortes