const Cortes = require("../helpers/Cortes")
const _cortes = new Cortes()
class Plan {
    constructor(ambiente) {
        this.ambiente = ambiente
        this.db = __Dynamo
    }
    async findAll() {
        var params = {
            TableName: "GSETSA-PlanStamps",
            ProjectionExpression: "#A,#B",
            ExpressionAttributeNames: {
                "#A": "planUuid",
                "#B": "fechainicio"
            },
        };
        return await this.db.scan(this.ambiente, params)
    }
    async deleteAll(allItems) {
        var deleteItems = []
        var aProms = []
        var batchCount = 0
        var totalBatch = 0
        var table = "GSETSA-PlanStamps"
        if (allItems.length)
            totalBatch = Math.ceil(allItems.length / 25) //Maximo de registros permitidos por Dynamo
        allItems.map((item, index) => {
            deleteItems.push({
                DeleteRequest: {
                    Key: {
                        planUuid: item.planUuid,
                        fechainicio: item.fechainicio
                    }
                }
            })
            if (deleteItems.length == 25 || (allItems.length - 1) == index) {
                batchCount++
                console.log("Batch : " + batchCount + "/" + totalBatch)
                console.log("To batch: ", deleteItems)
                aProms.push(this.deleteBatch(table, deleteItems))
                deleteItems = []
            }
        })
        console.log("Esperando eliminar todo ...")
        var resProms = await Promise.allSettled(aProms)
        console.log("RES DELETE ALL: ", resProms)

        var UnprocessedItems = []
        resProms.map(batch => {
            var un = batch.value.UnprocessedItems
            if (un
                && Object.keys(un).length === 0
                && Object.getPrototypeOf(un) === Object.prototype)
                return
            batch.value.UnprocessedItems[table].map(unp => {
                UnprocessedItems.push(unp.DeleteRequest.Key)
            })
        })
        return UnprocessedItems
    }
    deleteBatch(table, deleteItems) {
        let params = { RequestItems: {} };
        params.RequestItems[table] = deleteItems
        return this.db.deleteAll(this.ambiente, params)
    }
    async findByUser(accountUuid) {
        var params = {
            TableName: "Kronos-Plan",
            KeyConditionExpression: "#H = :h",
            ExpressionAttributeNames: {
                "#H": "accountUuid"
            },
            ExpressionAttributeValues: {
                ":h": accountUuid
            }
        };
        var res = await this.db.query(this.ambiente, params)
        if (!res.length)
            throw new Error("No se encontraron planes con el usuario (" + accountUuid + ")")

        var newData = []
        res.map(plan => {
            plan.fechainicio = this.fechaCreacion(plan.creationDate, plan.from)
            newData.push(plan)
        })
        var planesFiltrados = this.filter(newData.sort(this.sortDate))
        return planesFiltrados
    }

    async getStampsCorte(planUuid, noFix = false) {
        var params = {
            TableName: "GSETSA-PlanStamps",
            KeyConditionExpression: "#A = :a",
            ExpressionAttributeNames: {
                "#A": "planUuid"
            },
            ExpressionAttributeValues: {
                ":a": planUuid
            }
        }
        // var params = {
        //     TableName: "GSETSA-PlanStamps",
        //     KeyConditionExpression: "#A = :a and #B >= :b",
        //     ExpressionAttributeNames: {
        //         "#A": "planUuid",
        //         "#B":"fechainicio"
        //     },
        //     ExpressionAttributeValues: {
        //         ":a": planUuid,
        //         ":b":"2023-01-01T00:00:00.000Z"
        //     }
        // }
        if (noFix) {
            params.FilterExpression = "attribute_not_exists(#B)"
            params.ExpressionAttributeNames["#B"] = "fix"
        }

        return this.db.query(this.ambiente, params)
    }

    async prepararPlanes(aPlans) {
        var planes = []
        for (var a = 0; a < aPlans.length - 1; a++)
            planes.push(this.prepararPlan(aPlans[a], aPlans[a + 1]))
        planes.push(this.prepararPlan(aPlans[a], null))
        return Promise.all(planes)
    }
    async prepararPlan(plan, nextPlan) {
        var fInicio = plan.fechainicio
        var fIniCorte = fInicio
        var fFin = new Date()
        if (nextPlan && nextPlan.fechainicio <= fFin)
            fFin = nextPlan.fechainicio
        var planCount = await this.getStamps(plan.uuid)


        if (planCount.lastPlanStamps)
            fIniCorte = planCount.lastPlanStamps.fechafin
        if (fFin < fIniCorte)
            fFin = fIniCorte
        return {
            fIni: fInicio,
            fFin: fFin,
            limite: plan.units,
            uuid: plan.uuid,
            cortes: _cortes.diario(fIniCorte, fFin),
            consumo: planCount.consumo,
            lastPlanStamps: planCount.lastPlanStamps
        };
    }
    async getStamps(planUuid) {
        var stamps = 0
        var last = null
        var params = {
            TableName: "GSETSA-PlanStamps",
            KeyConditionExpression: "#A = :a",
            ExpressionAttributeNames: {
                "#A": "planUuid"
            },
            ExpressionAttributeValues: {
                ":a": planUuid
            }
        }
        var res = await this.db.query(this.ambiente, params)
        res.map(data => {
            if (data.stamps)
                stamps += data.stamps
            if (!last ||
                last.fechafin < new Date(data.fechafin)) {
                last = data
                last.fechainicio = new Date(last.fechainicio)
                last.fechafin = new Date(last.fechafin)
            }
        })
        return {
            consumo: stamps,
            lastPlanStamps: last
        }
    }
    filter(planes) {
        var newPlans = {}
        for (var a = 0; a < planes.length; a++) {
            var fi = planes[a].fechainicio
            if (!newPlans[fi]) {
                newPlans[fi] = planes[a]
            } else if (newPlans[fi].units < planes[a].units) {
                newPlans[fi] = planes[a]
            }
        }
        return Object.values(newPlans);
    }
    fechaCreacion(creationDate, from) {
        var fecha
        var tmpfecha
        var hora, min, sec
        if (creationDate) {
            fecha = creationDate
            tmpfecha = new Date(creationDate)
            hora = tmpfecha.getHours()
            min = tmpfecha.getMinutes()
            sec = tmpfecha.getSeconds()
        }
        if (from) {
            fecha = from
            if (tmpfecha) {
                tmpfecha = new Date(from)
                tmpfecha.setHours(hora)
                tmpfecha.setMinutes(min)
                tmpfecha.setSeconds(sec)
                fecha = tmpfecha.toISOString()
            }

        }
        if (!fecha) {
            throw Error("El plan del cliente no tiene una fecha de inicio");
        }

        return new Date(fecha);//Retorna fecha en hora local( a fecha le resta -5 de colombia)
    }
    sortDate(a, b) {
        var f_i = a.fechainicio
        var f_f = b.fechainicio
        if (f_i > f_f)
            return 1;
        if (f_i < f_f)
            return -1;
        // a must be equal to b
        return 0;
    }
}
module.exports = Plan