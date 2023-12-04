class User {
    constructor(ambiente) {
        this.table = "Kronos-Account"
        this.ambiente = ambiente
        this.db = __Dynamo
    }
    async find(uuid) {
        var params = {
            TableName: this.table,
            KeyConditionExpression: "#H = :h",
            ExpressionAttributeNames: {
                "#H": "uuid"
            },
            ExpressionAttributeValues: {
                ":h": uuid
            }
        }
        var res = await this.db.query(this.ambiente, params)
        if (res.length == 0)
            throw new Error("No se encuentra el usuario (" + uuid + ")")
        if (res.length > 1)
            throw new Error("Mas de un usuario para el mismo identificador (" + uuid + ")")
        return res[0]
    }
    async findAll(activos = false) {
        var params = {
            TableName: this.table,
            ProjectionExpression: "#A,#B",
            ExpressionAttributeNames: {
                "#A": "uuid",
                "#B": "company",
            },
        };
        var data = await this.db.scan(this.ambiente, params)
        if (!data.length)
            return data
        if (activos) {
            data = data.filter((i) => { return i.status })
        }
        return data.sort(this.sortName)

    }
    sortName(a, b) {
        return ('' + a.company.name.trim()).localeCompare(b.company.name.trim());
    }
}
module.exports = User