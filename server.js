var cron = require('croner');
var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');
var port = process.env.PORT;
var app = express();

app.use(bodyParser.json());
app.use(express.static(__dirname));

app.get('/', function(req,res){
	res.send('index.html')
});

var auth = new Buffer("cloud.admin" + ':' + "sOotHing@8CorD").toString('base64');

var url = 'https://dbcs.emea.oraclecloud.com/paas/service/dbcs/api/v1.1/instances/gse00000504/phpdb';

var options_GET = {
    url: url,
    method: 'GET',
    headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/json',
        'X-ID-TENANT-NAME': 'gse00000504'
    }
};

var options_POST = {  // POST
    //url: 'https://apaas.europe.oraclecloud.com/paas/service/apaas/api/v1.1/apps/gse00000504/App1/stop',
    url: url,
    method: 'POST',
    headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/json',
        'X-ID-TENANT-NAME': 'gse00000504'
    },
    body: {
        'lifecycleState' : 'Start'
    },
    json: true
};

var jobMaxCount = 5;
var callBacks = [
    function() { callBack_0() },
    function() { callBack_1() },
    function() { callBack_2() },
    function() { callBack_3() },
    function() { callBack_4() }
];

var jobCount = 0;
var jobs = [];
var scheduler = [];
var scheduledJobs = [];
jobs[0] = '*/5 * * * * *';
jobs[1] = '*/10 * * * * *';
jobs[2] = '*/2 * * * * *';
jobs[3] = '*/15 * * * * *';
jobs[4] = '*/3 * * * * *';

app.get('/jobs', function(req, res) {
  console.log(jobs);
  res.send({ jobs: jobs });
});

app.get('/add', function(req, res) {
  if(jobCount == jobMaxCount)
  {
    return res.status(400).json( { error: "JOB MAX COUNT REACHED" });
  }
  scheduler[jobCount] = cron(jobs[jobCount]);
  scheduledJobs[jobCount] = scheduler[jobCount].schedule(callBacks[jobCount]);
  jobCount++;
  console.log(jobCount);
  res.send({ jobs: jobs });
});

function callBack_0()
{
    console.log('handle job 0');
    /*
    request(options_GET, function (error, response, body) {
      console.log(response.statusCode);
    });
    */
}

function callBack_1()
{
    console.log('handle job 1');
}

function callBack_2()
{
    console.log('handle job 2');
}

function callBack_3()
{
    console.log('handle job 3');
}

function callBack_4()
{
    console.log('handle job 4');
}

app.listen(port, function() {
  console.log('server listening on port ' + port);
});
