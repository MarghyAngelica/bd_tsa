class StampKronos {
    constructor(ambiente) {
        this.table = "Kronos-TimeStamp"
        this.ambiente = ambiente
        this.db = __Dynamo
    }
    async find(accountUuid, fi, ff) {
        var rsa = 0
        var ec = 0
        var params = {
            TableName: this.table,
            IndexName: "accountUuid-associatedDate-index",
            //Select: 'COUNT',
            KeyConditionExpression: "#H = :h and #J between :fechainicio and :fechafin",
            ExpressionAttributeNames: {
                "#H": "accountUuid",
                "#J": "associatedDate"
            },
            ExpressionAttributeValues: {
                ":h": accountUuid,
                ":fechainicio": fi.toISOString(),
                ":fechafin": ff.toISOString()
            }
        };
        var res = await this.db.query(this.ambiente, params)
        res.forEach(element => {
            var ip = element.ip
            if(ip.includes(__Config.algorithm.ec.ip)){
                ec++
            }else{
                rsa++
            }
        })
        return {
            stamps: res.length,
            rsa,
            ec,
            fechainicio: fi.toISOString(),
            fechafin: ff.toISOString()
        };
    }
}
module.exports = StampKronos