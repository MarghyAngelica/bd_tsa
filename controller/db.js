const { Client } = require('pg')

class db {
  constructor(dataConnection) {
    this.client = new Client(dataConnection)
    this.client.connect()
  }

  async insertDatos(datosMonitoreo, callback) {    
      var client = new Client(__Config.db)
      await client.connect()
      var ins = await client.query(`INSERT INTO datos (id,fecha, metodo, endpoint, status, req, res) values ('${datosMonitoreo.id}', '${datosMonitoreo.fecha}', '${datosMonitoreo.metodo}', '${datosMonitoreo.endpoint}', '${datosMonitoreo.status}', '${datosMonitoreo.req}', '${datosMonitoreo.res}')`)
      console.log(ins) 
      client.end()
  }


  async obtenerLogs(data) {
   
     var resQuery = await this.client.query(`select * from datos where cast(fecha as date) between '${data.fechaInicio}' and '${data.fechaFin}'`)
     console.log(' rows || ', resQuery.rows)
     var respuesta = resQuery.rows
    //const respuesta=[{"id":"1", "fecha": new Date().toISOString(), "metodo": "POST", "endpoint": "/readdatos", "req": "saludo", "res": "hola"},{"id":"2", "fecha": new Date().toISOString(), "metodo": "POST", "endpoint": "/readdatos", "req": "saludo", "res": "buenas tardes"},{"id":"3", "fecha": new Date().toISOString(), "metodo": "POST", "endpoint": "/readdatos", "req": "saludo", "res": "adios"}]
    


    return respuesta
  }
}

module.exports = db