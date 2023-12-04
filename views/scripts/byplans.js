
var dataNitActual = null;
var ambiente = "qa";
var main = () => {
    alertify.set('notifier', 'delay', 30);
    alertify.set('notifier', 'position', 'top-right');
    if ($('#selectAmbiente').val() == "produccion")
        ambiente = "produccion"
    events();

};
var onClickBuscarNit = () => {
    try {

        fechaInicio = new Date($("#inicioAnio").val(), $("#inicioMes").val() - 1, $("#inicioDia").val())
        if (fechaInicio.getMonth() != ($('#inicioMes').val() - 1)) {
            alertify.error('Fecha inválida, se usará el último día del mes')
            var a = new Date($("#inicioAnio").val(), $("#inicioMes").val())
            fechaInicio = new Date(a - 1)
        }
        fechaFin = new Date($("#finAnio").val(), $("#finMes").val() - 1, $("#finDia").val())
        if (fechaFin.getMonth() != ($('#finMes').val() - 1)) {
            alertify.error('Fecha inválida, se usará el último día del mes')
            var b = new Date($("#finAnio").val(), $("#finMes").val())
            console.log('b: ', b)
            fechaFin = new Date(b - 1)
        }
        var sendData = {
            ambiente,
            fechaInicio: fechaInicio.getFullYear() + "-" + (fechaInicio.getMonth() + 1).toString().padStart(2, '0') + "-" + fechaInicio.getDate().toString().padStart(2, '0'),
            fechaFin: fechaFin.getFullYear() + "-" + (fechaFin.getMonth() + 1).toString().padStart(2, '0') + "-" + fechaFin.getDate().toString().padStart(2, '0')
        }
        ajax("readDatos", sendData, function (resp) {
            if(!resp.success){
                alertify.error(resp.mensaje)
                return
            }
            console.log("response : ", resp);
            const dataTabla = resp.data
            crearTabla(dataTabla)
        });
    } catch (error) {
        console.log(error)
    }
}
var events = () => {
    $("#btnBuscarNit").click(() => { onClickBuscarNit() });
    $('#selectAmbiente').change(function () {
        ambiente = $(this).val();
        if (ambiente == 'produccion') {
            alertify.success('Se cambió el ambiente a producción');
            return;
        }
        alertify.success('Se cambió el ambiente a QA');
    })
}

// tabla tabs




//

var crearTabla = (dataTabla) =>{
    var header = ''
    header += '<tr>'
    header += '<th>ID</th>'
    header += '<th>Fecha</th>'
    header += '<th>Método</th>'
    header += '<th>Endpoint</th>'
    header += '<th>Status</th>'
    header += '<th>Request</th>'
    header += '<th>Response</th>'
    header += '</tr>'

    var html = header

    for (let index = 0; index < dataTabla.length; index++) {
        const element = dataTabla[index];
        html += '<tr>'
        html += '<td>' + element.id + '</td>'
        html += '<td>' + element.fecha + '</td>'
        html += '<td>' + element.metodo + '</td>'
        html += '<td>' + element.endpoint + '</td>'
        html += '<td>' + element.status + '</td>'
        html += '<td>' + element.req + '</td>'
        html += '<td>' + element.res + '</td>'
        html += '</tr>'
    }

    $('#tableStamps').html(html)
}


var filtrarDatosGrafica = (consumo, planes) => {
    var labels = []
    var dataConsumoEnMes = []
    var dataConsumoAcumulado = []
    var consumoAcumulado = 0
    var fechaCorte;
    var formatFechaIni;
    consumo.map((stamp) => {
        fechaCorte = new Date(stamp.id);
        formatFechaIni = fechaCorte.getFullYear() + "-" + (fechaCorte.getMonth() + 1).toString().padStart(2, '0') + "-" + fechaCorte.getDate().toString().padStart(2, '0');
        labels.push(formatFechaIni);
        consumoAcumulado += stamp.stamps
        dataConsumoAcumulado.push(consumoAcumulado)

        if (stamp.stamps)
            dataConsumoEnMes.push(stamp.stamps);
        else
            dataConsumoEnMes.push(0);

    })
    return {
        labels,
        dataConsumoEnMes,
        dataConsumoAcumulado
    }
}



var graficar = (labels, dataConsumoEnMes, dataConsumoAcumulado) => {
    $("#contenedorGrafica").html("");
    $("#contenedorGrafica").html('<canvas class="my-4 w-100 chartjs-render-monitor" id="myChart" width="1538" height="649" style="display: block; width: 1538px; height: 649px;"></canvas>');
    var ctx = document.getElementById('myChart')

    // eslint-disable-next-line no-unused-vars

    var myChart = new Chart(ctx, {
        type: 'doughnut',
        data: dataTabla,
        //{
        //     labels,
        //     datasets: [
        //         // {
        //         //     data: dataConsumoAcumulado,
        //         //     lineTension: 0,
        //         //     backgroundColor: 'transparent',
        //         //     borderColor: 'transparent',
        //         //     borderWidth: 0,
        //         //     pointBackgroundColor: '#ff0000',
        //         //     pointRadius: 5,
        //         // },
        //         {
        //             fill: 'origin',
        //             data: dataConsumoEnMes,
        //             lineTension: 0.2,
        //             backgroundColor: 'rgba(0, 123, 255, 0.5)',
        //             borderColor: 'rgba(0, 123, 255, 0.5)',
        //             pointBackgroundColor: 'rgba(0, 123, 255, 0.5)',
        //             borderWidth: 0.5,
        //         }
        //     ]
        // },
        options: {
            tooltips: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function (tooltipItem, data) {
                        //var label = data.datasets[tooltipItem.datasetIndex].label || '';
                        return formatCurrency(tooltipItem.yLabel);
                    }
                }
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: false,
                        callback: function (label, index, labels) {
                            return formatCurrency(label);
                        }
                    }
                }]
            },
            legend: {
                display: false
            }
        }
        // options: {
        //     responsive: true,
        //     // tooltips: {
        //     //     mode: 'index',
        //     //     intersect: false,
        //     // },
        //     // hover: {
        //     //     mode: 'nearest',
        //     //     intersect: true
        //     // },
        //     scales: {
        //         xAxes: [{
        //             display: true,
        //             scaleLabel: {
        //                 display: true,
        //                 labelString: 'Cortes'
        //             }
        //         }],
        //         yAxes: [{
        //             display: true,
        //             scaleLabel: {
        //                 display: true,
        //                 labelString: 'Estampas'
        //             }
        //         }]
        //     }
        // }
    })
}

$(document).ready(main);