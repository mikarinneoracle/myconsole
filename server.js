var cron = require('croner');
var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');
var port = process.env.PORT;
var app = express();

app.use(bodyParser.json());
app.use(express.static(__dirname));

var RUNNING = "running";
var STOPPED = "stopped";
var PAUSED = "paused";

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

app.get('/jobs', function(req, res) {
  res.send({ jobs: jobs });
});

app.put('/jobs', function(req, res) {
  if(jobCount == jobMaxCount)
  {
    return res.status(400).json( { error: "Job max count " + jobMaxCount + " reached." });
  }
	var job = req.body;
	jobs[jobCount] = {"cron" : job.cron, "operation" : job.operation, "service" : job.service, "state" : RUNNING};
	try {
		  scheduler[jobCount] = cron(job.cron);
			scheduledJobs[jobCount] = scheduler[jobCount].schedule(callBacks[jobCount]);
	} catch(err) {
		console.log(err.message);
		return res.status(400).json( { error: err.message });
	}
  jobCount++;
  res.send({ jobs: jobs });
});

app.post('/state/:id', function(req, res) {
	var id = req.params.id;
	console.log(id);
	try {
			if(jobs[id].state == RUNNING)
			{
			  scheduledJobs[id].pause();
				jobs[id].state = PAUSED;
			} else {
				scheduledJobs[id].resume();
				jobs[id].state = RUNNING;
			}
	} catch(err) {
		console.log(err.message);
		return res.status(400).json( { error: err.message });
	}
  res.send({ jobs: jobs });
});

function callBack_0()
{
		var job = jobs[0]
    console.log('handle job 0 ' + job.operation);
    /*
    request(options_GET, function (error, response, body) {
      console.log(response.statusCode);
    });
    */
}

function callBack_1()
{
		var job = jobs[1]
		console.log('handle job 1 ' + job.operation);
}

function callBack_2()
{
		var job = jobs[2]
		console.log('handle job 2 ' + job.operation);
}

function callBack_3()
{
		var job = jobs[3]
		console.log('handle job 3 ' + job.operation);
}

function callBack_4()
{
		var job = jobs[4]
		console.log('handle job 4 ' + job.operation);
}

app.listen(port, function() {
  	console.log('server listening on port ' + port);
});
