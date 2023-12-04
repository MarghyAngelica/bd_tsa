const uniqid = require('uniqid');
class Stamp {
    constructor(ambiente) {
        this.table = "GSETSA-PlanStamps"
        this.ambiente = ambiente
        this.db = __Dynamo
    }
    async get(userUuid, fi, ff) {
        var params = {
            TableName: this.table,
            IndexName: "accountUuid-fechainicio-index",
            //FilterExpression: "#H = :h and #J between :fechainicio and :fechafin",
            KeyConditionExpression: "#H = :h and #J between :fechainicio and :fechafin",
            ExpressionAttributeNames: {
                "#H": "accountUuid",
                "#J": "fechainicio"
            },
            ExpressionAttributeValues: {
                ":h": userUuid,
                ":fechainicio": fi.toISOString(),
                ":fechafin": ff.toISOString()
            }
        };
        var time = Date.now()
        var res = await this.db.query(this.ambiente, params)
        var total = 0
        var planes = {}
        console.log("STAMP 0: ", Date.now() - time, " LENGTH:", res.length)
        time = Date.now()

        res.map(data => {
            total += data.stamps
            if (!planes[data.planUuid]) {
                planes[data.planUuid] = {
                    planUuid: data.planUuid,
                    stamps: 0
                }
            }
            planes[data.planUuid].stamps += data.stamps
        })
        console.log("STAMP: ", Date.now() - time)
        return {
            fi,
            ff,
            stamps: total,
            planes: Object.values(planes)
        };
    }
    async getByPlan(planUuid, fi) {
        var params = {
            TableName: this.table,
            //IndexName: "accountUuid-fechainicio-index",
            KeyConditionExpression: "#H = :h and #J = :fechainicio",
            ExpressionAttributeNames: {
                "#H": "planUuid",
                "#J": "fechainicio"
            },
            ExpressionAttributeValues: {
                ":h": planUuid,
                ":fechainicio": fi.toISOString()
            }
        };
        return this.db.query(this.ambiente, params)
    }
    async getDiario(userUuid, fi, ff) {
        var params = {
            TableName: this.table,
            IndexName: "accountUuid-fechainicio-index",
            KeyConditionExpression: "#H = :h and #J between :fechainicio and :fechafin",
            ExpressionAttributeNames: {
                "#H": "accountUuid",
                "#J": "fechainicio"
            },
            ExpressionAttributeValues: {
                ":h": userUuid,
                ":fechainicio": fi.toISOString(),
                ":fechafin": ff.toISOString()
            }
        };
        return await this.db.query(this.ambiente, params)
    }
    async update(planUuid, fi, ff, stamps, rsa, ec, fix = false) {
        var diferencia  = stamps - (rsa + ec)
        var newRsa = rsa
        if(diferencia > 0)
            newRsa += diferencia
        try {
            var params = {
                TableName: this.table,
                Key: { planUuid, fechainicio: fi.toISOString() },
                UpdateExpression: "set stamps = :a , fechafin = :b, rsa = :c, ec = :d",
                ExpressionAttributeValues: {
                    ":a": stamps,
                    ":b": ff.toISOString(),
                    ":c": newRsa,
                    ":d" : ec
                },
                ReturnValues: "UPDATED_NEW"
            }
            if (fix) {
                params.UpdateExpression += ", fix = :z"
                params.ExpressionAttributeValues[":z"] = true
            }
            return this.db.update(this.ambiente, params)
        } catch (e) {
            console.log("ERROR UPDATE", e)
        }

    }
    async put(accountUuid, planUuid, fi, ff, stamps, rsa, ec) {
        try {
            var params = {
                TableName: this.table,
                Item:
                {
                    //uuid: uniqid(),
                    accountUuid,
                    planUuid,
                    fechainicio: fi.toISOString(),
                    fechafin: ff.toISOString(),
                    stamps,
                    rsa,
                    ec
                }
            }
            return await this.db.put(this.ambiente, params)
        } catch (e) {
            console.log("ERROR PUT", e)
        }
    }
    async planStamps(planUuid) {
        var params = {
            TableName: this.table,
            //FilterExpression: "#H = :h",
            KeyConditionExpression: "#H = :h",
            ExpressionAttributeNames: {
                "#H": "planUuid"
            },
            ExpressionAttributeValues: {
                ":h": planUuid
            }
        };
        var res = await this.db.query(this.ambiente, params)
        var total = 0
        res.map(data => {
            total += data.stamps
        })
        return total;
    }
}
module.exports = Stamp