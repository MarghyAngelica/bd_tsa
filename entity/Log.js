
class Log {
    constructor(ambiente) {
        this.ambiente = ambiente
        this.db = __Dynamo
        this.table = "FC-Log"
    }
    async findAll() {
        var params = {
            TableName: this.table,
            ProjectionExpression: "#A",
            ExpressionAttributeNames: {
                "#A": "uuid",
            },
        };
        return await this.db.scan(this.ambiente, params)
    }
    async deleteAll(allItems) {
        var deleteItems = []
        var aProms = []
        var batchCount = 0
        var totalBatch = 0
        var table = this.table
        if (allItems.length)
            totalBatch = Math.ceil(allItems.length / 25) //Maximo de registros permitidos por Dynamo
        allItems.map((item, index) => {
            deleteItems.push({
                DeleteRequest: {
                    Key: {
                        uuid: item.uuid,
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
    
}
module.exports = Log