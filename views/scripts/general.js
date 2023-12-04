const showLoadingPDF = () => {
    var load = document.createElement("div");
    load.setAttribute('id', 'loadingPDF')
    //load.style.display = 'block';
    //load.innerHTML = '<svg class="svg-loading" version="1.1" id="L6" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><rect fill="none" stroke="#fff" stroke-width="4" x="25" y="25" width="50" height="50">    <animateTransform       attributeName="transform"       dur="0.5s"       from="0 50 50"       to="180 50 50"       type="rotate"       id="strokeBox"       attributeType="XML"       begin="rectBox.end"/>    </rect>     <rect x="27" y="27" fill="#fff" width="46" height="50">    <animate       attributeName="height"       dur="1.3s"       attributeType="XML"       from="50"        to="0"       id="rectBox"     fill="freeze"begin="0s;strokeBox.end"/></rect></svg>'
    load.innerHTML = '<svg class="svg-loading" version="1.1" id="L7" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"  viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"> <path fill="#fff" d="M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3  c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z">      <animateTransform          attributeName="transform"          attributeType="XML"          type="rotate"         dur="2s"          from="0 50 50"         to="360 50 50"          repeatCount="indefinite" />  </path> <path fill="#fff" d="M42.3,39.6c5.7-4.3,13.9-3.1,18.1,2.7c4.3,5.7,3.1,13.9-2.7,18.1l4.1,5.5c8.8-6.5,10.6-19,4.1-27.7  c-6.5-8.8-19-10.6-27.7-4.1L42.3,39.6z">      <animateTransform          attributeName="transform"          attributeType="XML"          type="rotate"         dur="1s"          from="0 50 50"         to="-360 50 50"          repeatCount="indefinite" />  </path> <path fill="#fff" d="M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5  L82,35.7z">      <animateTransform          attributeName="transform"          attributeType="XML"          type="rotate"         dur="2s"          from="0 50 50"         to="360 50 50"          repeatCount="indefinite" /></path></svg>';
    document.body.prepend(load);
}
const hideLoadingPDF = () => {
    let load = document.getElementById('loadingPDF')
    if (load)
        load.remove()
}
const ajax = (url, sendData, fn) => {
    showLoadingPDF()
    $.ajax({
        type: "POST",
        url: url,
        data: sendData,
        timeout: 0,
        // beforeSend: function (jqXHR, settings) {
        //     jqXHR.setRequestHeader('Connection', 'close');
        // },
        success: function (data) {
            hideLoadingPDF();
            fn(data)
        },
        error: function (error, textStatus, errorThrown) {
            hideLoadingPDF();
            console.log('error', error, textStatus, errorThrown);
            if (error.responseJSON && error.responseJSON.mensaje) {
                alertify.error(error.responseJSON.mensaje);
            } else {
                alertify.error("Error en la conexión con el servidor");
            }
        },
        fail: function (a, b, c) {
            console.log('fail', a, b, c);
            hideLoadingPDF();
            // if (error.responseJSON && error.responseJSON.mensaje) {
            //     alertify.error(error.responseJSON.mensaje);
            // } else {

            // }
            alertify.error("Error en la conexión con el servidor");
        }
    });


    // $.post(url, sendData, function (data) {
    //     hideLoadingPDF();
    //     fn(data)
    // }).fail(function (error, data, e, h) {
    //     hideLoadingPDF();
    //     if (error.responseJSON && error.responseJSON.mensaje) {
    //         alertify.error(error.responseJSON.mensaje);
    //     } else {
    //         alertify.error("Error en la conexión con el servidor");
    //     }
    // }).always(function () {
    //     hideLoadingPDF();
    // });;
}
function formatCurrency(number) {
    var formatted = new Intl.NumberFormat("en-US", {
        //style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(number);
    return formatted;
}
function toggleClassTable(e, className) {
    console.log("pasa")
    var rows = $("#tableStamps > tbody > tr")
    var el = $(e.target).parent()
    rows.map((index, data) => {
        $(data).removeClass(className);
    })
    el.addClass(className)
}

function getIconDownload(uuid, fechainicio, fechafin, stamps) {
    var iconDownload = '<svg ' +
        'width="1em" height="1em" viewBox="0 0 16 16" ' +
        'nit=' + uuid + ' ' +
        'fechainicio="' + fechainicio + '" ' +
        'fechafin="' + fechafin + '" ' +
        'class="bi bi-download links-descarga"  ' +
        'fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
        '<path ' +
        'nit=' + uuid + ' ' +
        'fechainicio="' + fechainicio + '" ' +
        'fechafin="' + fechafin + '" ' +
        'fill-rule="evenodd" d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>' +
        '<path ' +
        'nit=' + uuid + ' ' +
        'fechainicio="' + fechainicio + '" ' +
        'fechafin="' + fechafin + '" ' +
        ' fill-rule="evenodd" d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>' +
        '</svg>';
    if (stamps == 0)
        iconDownload = "--";
    return iconDownload
}
var crearEventosDescargaTabla = () => {
    $('.links-descarga').click((e) => {
        var sendData = {
            nit: $(e.target).attr('nit'),
            fechaInicio: $(e.target).attr('fechainicio'),
            fechaFin: $(e.target).attr('fechafin'),
            ambiente
        }
        if (!sendData.nit) {
            alertify.error("el nit no debe ser nulo");
            return;
        }
        ajax("getPeriodoDetalle", sendData, function (data) {
            var a = document.createElement("a"); //Create <a>
            a.href = "data:application/octet-stream;base64," + data.base64;
            a.download = data.name; //File name Here
            a.click(); //Downloaded file
            a.remove();
        });
    })
}
function formatDate(f){
    f = new Date(f)
    return f.getFullYear() + "/" +
        (f.getMonth() + 1).toString().padStart(2, '0') + "/" +
        f.getDate().toString().padStart(2, '0');
}
