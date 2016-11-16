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

var jobMaxCount = 10;
var callBacks = [
    function() { callBack_0() },
    function() { callBack_1() },
    function() { callBack_2() },
    function() { callBack_3() },
    function() { callBack_4() },
		function() { callBack_5() },
		function() { callBack_6() },
		function() { callBack_7() },
		function() { callBack_8() },
		function() { callBack_9() }
];

var jobCount = 0;
var jobs = [];
var scheduler = [];
var scheduledJobs = [];

app.get('/jobs', function(req, res) {
  res.send({ "jobs": jobs , "date": new Date() });
});

app.get('/job/:id', function(req, res) {
	var id = req.params.id;
  res.send({ "job": jobs[id], "date": new Date() });
});

app.post('/jobs', function(req, res) {
	var job = req.body;
	var auth = getAuth(job.user, job.pass);
	var id;
	if(job.id != null)
	{
		id = job.id;
		scheduledJobs[id].stop();
	} else {
		if(jobCount == jobMaxCount)
	  {
	    return res.status(400).json( { error: "Job max count " + jobMaxCount + " reached." });
	  }
		id = jobCount;
	}
	var options = "";
	if(job.operation == 'START')
	{
		options = getOptionsStart(job.endpoint, job.service, auth, job.tenant);
	} else if (job.operation == 'STOP')
	{
		options = getOptionsStop(job.endpoint, job.service, auth, job.tenant);
	} else {
		options = getOptionsInfo(job.endpoint, job.service, auth, job.tenant);
	}
	try {
		  scheduler[id] = cron(job.cron);
			scheduledJobs[id] = scheduler[id].schedule(callBacks[id]);
	} catch(err) {
		console.log(err.message);
		return res.status(400).json( { error: err.message });
	}
	jobs[id] = {"name" : job.name, "cron" : job.cron, "operation" : job.operation,
										"endpoint" : job.endpoint, "service" : job.service, "state" : RUNNING,
										"tenant" : job.tenant, "status" : "", "auth" : auth, "options" : options,
										"message" : "", "id" : id, "user" : job.user, "pass" : job.pass
									};
	if(job.id == null)
	{
		jobCount++;
	}
  res.send({ "jobs": jobs, "date": new Date() });
});

app.post('/state/:id', function(req, res) {
	var id = req.params.id;
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
  res.send({ "jobs": jobs, "date": new Date() });
});

function getAuth(user, pass)
{
	return new Buffer(user + ':' + pass).toString('base64');
}

function getOptionsInfo(endpoint, service, auth, tenant)
{
	var options = {
    url: endpoint + '/paas/service/dbcs/api/v1.1/instances/' + tenant + '/' + service,
    method: 'GET',
    headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/json',
        'X-ID-TENANT-NAME': tenant
    }
	}
	return options;
};

function getOptionsStart(endpoint, service, auth, tenant)
{
	var options = {
    url: endpoint + '/paas/service/dbcs/api/v1.1/instances/' + tenant + '/' + service,
    method: 'POST',
    headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/json',
        'X-ID-TENANT-NAME': tenant
    },
    body: {
        'lifecycleState' : 'Start'
    },
    json: true
	}
	return options;
};

function getOptionsStop(endpoint, service, auth, tenant)
{
	var options = {
    url: endpoint + '/paas/service/dbcs/api/v1.1/instances/' + tenant + '/' + service,
    method: 'POST',
    headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/json',
        'X-ID-TENANT-NAME': tenant
    },
    body: {
        'lifecycleState' : 'Stop'
    },
    json: true
	}
	return options;
};

function handleJob(job)
{
	console.log('Running ' + job.name + ' ' + job.operation);
	console.log(job.options);
	request(job.options, function (error, response, body) {
		if(response)
		{
				console.log(response.statusCode);
				job.status = response.statusCode;
				job.message = body;
		}
		if(error)
		{
				 console.log(error);
				 job.status = 'ERR';
				 job.message = error.message;
		}
		if(body) console.log(body);
	});
}

// As many callbacks as there are maximum jobs

function callBack_0() { handleJob(jobs[0]); }

function callBack_1() { handleJob(jobs[1]); }

function callBack_2() { handleJob(jobs[2]); }

function callBack_3() { handleJob(jobs[3]); }

function callBack_4() { handleJob(jobs[4]); }

function callBack_5() { handleJob(jobs[5]); }

function callBack_6() { handleJob(jobs[6]); }

function callBack_7() { handleJob(jobs[7]); }

function callBack_8() { handleJob(jobs[8]); }

function callBack_9() { handleJob(jobs[9]); }

app.listen(port, function() {
  	console.log('server listening on port ' + port);
});
