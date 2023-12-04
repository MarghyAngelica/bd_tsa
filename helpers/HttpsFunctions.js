class HttpsFunctions{
    constructor(){
        this.https = require('https')
    }

    ajax(host, path, method, data) {
        return new Promise((resolve, reject) => {
            var sData = JSON.stringify(data)

            var httpsRequest = this.https.request({
                host,
                path,
                port: '443',
                method,
                timeout: 3000,
                headers: {
                    'Content-Type': 'application/json',
                    //'Content-Length': sData.length
                }
            },
                (response) => {
                    var str = ''
                    response.on('data', function (chunk) {
                        str += chunk;
                    });

                    response.on('end', function () {
                        try {
                            //let oDataResponse = JSON.parse(str);
                            resolve(str);
                        }
                        catch (e) {
                            throw Error("ERROR_SERVER_EMAIL|Error de comunicación con el servidor de correos");
                        }

                    });

                }
            );

            httpsRequest.on('timeout', function (err) {
                throw Error("ERROR_SERVER_TIMEOUT|" + err.message);

            });
            httpsRequest.on('error', function (err) {
                throw Error("ERROR_SERVER_ERROR|" + err.message);

            });
            httpsRequest.write(sData);
            httpsRequest.end();
        });
    }
}

module.exports = HttpsFunctions