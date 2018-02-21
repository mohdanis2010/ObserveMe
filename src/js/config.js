/*
 Environment configurations and application constants
 */
var appEnv = {
    env: "prod",
//    env: "dev",
    prod: {
        baseWSURL: 'https://mas.barcapint.com/apps/service/desktop',
        requestMethod:'POST',
        requestHeader:{'Content-Type':'application/json'},
        baseURL:'/apps/launch?id=OME#/'
    },
    uat: {
        baseWSURL: 'https://gbrpsm030000309.intranet.barcapint.com/apps/service/desktop',
        requestMethod:'POST',
        requestHeader:{'Content-Type':'application/json'},
        baseURL:'/apps/launch?id=OME#/'
    },
    sit: {
        baseWSURL: 'https://gbrdsm030000271.intranet.barcapint.com/apps/service/desktop',
        requestMethod:'POST',
        requestHeader:{'Content-Type':'application/json'},
        baseURL:'/apps/launch?id=OME#/'
    },
    //dev: {
    //    baseWSURL: 'https://gbrpsm030000309.intranet.barcapint.com/apps/service/mobile',
    //    requestMethod:'POST',
    //    requestHeader:{'Content-Type':'application/json', 'BRID':'E20046408', 'LoginAccount':'CLIENT.BARCLAYSCORP.COM'},
    //    baseURL:'#/'
    //},
    dev: {
        baseWSURL: 'http://gbrdsm030000271.intranet.barcapint.com/apps/service/mobile',
        requestMethod:'POST',
        requestHeader:{'Content-Type':'application/json', 'BRID':'G44715845', 'LoginAccount':'CLIENT.BARCLAYSCORP.COM'},
        baseURL:'#/'
    },
    stub: {
        //baseWSURL: 'http://10.193.82.185:8001/',     //anis
        baseWSURL: '10.193.82.199:8001', //umar
        //baseWSURL: 'http://localhost:8001/',
        requestMethod:'GET',
        requestHeader:{'Content-Type':'application/json'},
        baseURL:'#'

    }
};