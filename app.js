const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const url = require('url');
const qs = require('querystring');

const index_page = fs.readFileSync('./index.ejs','utf8');
const login_page = fs.readFileSync('./login.ejs','utf8');

const max_num = 10; //最大保管数
const filename = 'mydata.txt'; //データファイル
var message_data; //データ

//MainProgram
readFromFile(filename);

var server = http.createServer(getFormClient);

server.listen(3000);
console.log('Server start!');

//function
function getFormClient(req,res){
    var url_parts = url.parse(req.url,true);
    switch(url_parts.pathname){
        case '/':
            response_index(req,res);
            break;
        case '/login':
            response_login(req,res);
            break;
        default:
            res.writeHead(200,{'Content-Type':'text/plain'});
            res.end('no page...');
            break;
    }
}
//longin
function response_login(req,res){
    var content = ejs.render(login_page,{});
    res.writeHead(200,{'Content-Type':'text/html'});
    res.write(content);
    res.end();
}

//index
// function response_index(req, res) {
//     //POST
//     if (req.method == 'POST') {
//         var body = '';

//         req.on('data', function (data) {
//             body += data;
//         });

//         req.on('end', function () {
//             var data = qs.parse(body);
//             addToData(data.id, data.msg, filename, req);
//             write_index(req, res);
//         });
//     } else {
//         write_index(req, res);
//     }
// }
//ここからGPT
function response_index(req, res) {
    //POST
    if (req.method == 'POST') {
        var body = '';

        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            var data = qs.parse(body);
            addToData(data.id, data.msg, filename, req, function() {
                write_index(req, res);
            });
        });
    } else {
        write_index(req, res);
    }
}
//ここまでGPT
function write_index(req,res){
    var msg = "※何かメッセージを書いてください。";
    var content = ejs.render(index_page,{
        title:'Index',
        content: msg,
        data: message_data,
        filename:'data_item'
    });
    res.writeHead(200,{'Content-Type':'text/html'});
    res.write(content);
    res.end();
}

function readFromFile(fname){
    fs.readFile(fname,'utf8',(err,data) => {
        message_data = data.split('\n');
    })
}

function addToData(id,msg,fname,req){
    var obj = {'id':id,'msg':msg};
    var obj_str = JSON.stringify(obj);

    console.log('add data: ' + obj_str);
    message_data.unshift(obj_str);
    if(message_data.length > max_num){
        message_data.pop();
    }
    saveToFile(fname);
}

function saveToFile(fname){
    var data_str = message_data.join('\n');
    fs.writeFile(fname,data_str , (err) => {
        if(err){throw err;}
    });
}

