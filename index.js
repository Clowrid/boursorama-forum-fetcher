let express = require('express');
let app = express();

app.use('/css',express.static('css'));
app.use('/js',express.static('js'));

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 8000;
}
app.listen(port);