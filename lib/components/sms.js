var http = require('http');
var urlencode = require('urlencode');

module.exports.sendSMS = function(phoneNumbers,message,callback){
    var msg=urlencode(message);
    //number format: +919482222143...for multiple numbers send in an array
    var numbers=phoneNumbers;
    var username='bkm.blore@gmail.com';
    var hash='e4e4a3e59ffa2ab4a6ed9bf7052f759d16140164d5c1b1a3d37cc7746ab67d9b';
    var sender='txtlcl';
    var data='username='+username+'&hash='+hash+'&sender='+sender+'&numbers='+numbers+'&message='+msg;
    var options = {
        host: 'api.textlocal.in',
        path: '/send?'+data
    };
    var callback1 = function(response) {
        var str = '';
        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });
        //the whole response has been recieved, so we just print it out here
        response.on('end', function () {
            callback(str);
        });
    }
    http.request(options, callback1).end();
}