var cron = require('croner');
var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');
var auth = require('basic-auth');
var port = process.env.PORT;
var username = process.env.USER || 'demo';
var password = process.env.PASS || 'demo';
var mongodb_url = process.env.MONGODB || 'localhost:27017';
var mongodb_user = process.env.MONGODB_USER || '';
var mongodb_pass = process.env.MONGODB_PASS || '';
var app = express();
var MongoClient = require('mongodb').MongoClient;
var mongodb;

app.use(bodyParser.json());
app.use(express.static(__dirname));

app.use(function(req, res, next) {
    var user = auth(req);

    if (user === undefined || user['name'] !== username || user['pass'] !== password) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="Myconsole"');
        res.end('Unauthorized');
    } else {
        next();
    }
});

var log = [];
var RUNNING = "running";
var STOPPED = "stopped";
var PAUSED = "paused";

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

if(mongodb_url)
{
	MongoClient.connect('mongodb://' + mongodb_url + '/console', function(err, db) {
		if(err)
		{
			console.log(err);
			return;
		}
	  console.log("Connected successfully to mongodb at " + mongodb_url);
		db.admin().authenticate(mongodb_user, mongodb_pass, function(err, res)
		{
			if(err)
			{
				console.log(err);
				return;
			}
			mongodb = db;
			var collection = mongodb.collection('documents');
			collection.find({}).toArray(function(err, persistedJobs) {
				if(err)
				{
					console.log(err);
				} else {
					jobs = persistedJobs;
					jobCount = jobs.length;
					// Kick-off schedulers
					for(i = 0; i < jobCount; i++)
					{
						try {
								scheduler[i] = cron(jobs[i].cron);
								scheduledJobs[i] = scheduler[i].schedule(callBacks[i]);
								console.log("Kicked off job " + jobs[i].id);
								if(jobs[i].state == PAUSED)
								{
									scheduledJobs[i].pause();
								}
						} catch(err) {
							console.log(err.message);
						}
					}
				}
			});
		});
	});
}

app.get('/jobs', function(req, res) {
  res.send({ "jobs": jobs , "date": new Date(), "log" : log });
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
		options = getOptionsStart(job.endpoint, job.service, job.type, auth, job.tenant);
	} else if (job.operation == 'STOP')
	{
		options = getOptionsStop(job.endpoint, job.service, job.type, auth, job.tenant);
	} else {
		options = getOptionsInfo(job.endpoint, job.service, job.type, auth, job.tenant);
	}
	try {
		  scheduler[id] = cron(job.cron);
			scheduledJobs[id] = scheduler[id].schedule(callBacks[id]);
	} catch(err) {
		console.log(err.message);
		return res.status(400).json( { error: err.message });
	}
	jobs[id] = {"name" : job.name, "cron" : job.cron, "operation" : job.operation, "type" : job.type,
										"endpoint" : job.endpoint, "service" : job.service, "state" : RUNNING,
										"tenant" : job.tenant, "status" : "", "auth" : auth, "options" : options,
										"message" : "", "id" : id, "user" : job.user, "pass" : job.pass, "last" : ""
									};
	if(job.id == null)
	{
		jobCount++;
	}
	// Persist to database
	if(mongodb)
	{
		persist();
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
	if(mongodb)
	{
		persist();
	}
  res.send({ "jobs": jobs, "date": new Date() });
});

function getAuth(user, pass)
{
	return new Buffer(user + ':' + pass).toString('base64');
}

function getOptionsInfo(endpoint, service, type, auth, tenant)
{
	var options = {
    url: endpoint + '/paas/service/' + type + '/api/v1.1/instances/' + tenant + '/' + service,
    method: 'GET',
    headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/json',
        'X-ID-TENANT-NAME': tenant
    }
	}
	return options;
};

function getOptionsStart(endpoint, service, type, auth, tenant)
{
	var options = {
    url: endpoint + '/paas/service/' + type + '/api/v1.1/instances/' + tenant + '/' + service,
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

function getOptionsStop(endpoint, service, type, auth, tenant)
{
	var options = {
    url: endpoint + '/paas/service/' + type + '/api/v1.1/instances/' + tenant + '/' + service,
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
	console.log('Running ' + job.name + ' ' + job.operation + ' ' + job.cron);
	console.log(job.options);
	if(log.length > 100)
	{
		log = [];
	}
	log.push('Running ' + job.name + ' ' + job.operation + ' ' + job.cron);
	request(job.options, function (error, response, body) {
		job.last = new Date();
		if(response)
		{
				console.log(response.statusCode);
				job.status = response.statusCode;
				if(body)
				{
						job.message = body;
				} else {
						job.message = "OK";
				}
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

function persist()
{
	var collection = mongodb.collection('documents');
	collection.remove();
	collection.insertMany(jobs, function(err, r) {
		if(err)
		{
				console.log(err);
		}
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
