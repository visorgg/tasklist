'use strict';
var childProcess = require('child_process');
var neatCsv = require('neat-csv');
var sec = require('sec');

module.exports = function (opts, cb) {
	if (process.platform !== 'win32') {
		throw new Error('Windows only');
	}

	if (typeof opts !== 'object') {
		cb = opts;
		opts = {};
	}

	var args = ['/v', '/nh', '/fo', 'CSV'];

	if (opts.system && opts.username && opts.password) {
		args.push('/s', opts.system, '/u', opts.username, '/p', opts.password);
	}

	childProcess.execFile('tasklist', args, function (err, stdout) {
		if (err) {
			cb(err);
			return;
		}

		neatCsv(stdout, {
			headers: [
				'imageName',
				'pid',
				'sessionName',
				'sessionNumber',
				'memUsage',
				'status',
				'username',
				'cpuTime',
				'windowTitle'
			]
		}, function (err, data) {
			if (err) {
				cb(err);
				return;
			}

			data = data.map(function (el) {
				Object.keys(el).forEach(function (key) {
					if (el[key] === 'N/A') {
						el[key] = null;
					}
				});

				el.pid = Number(el.pid);
				el.sessionNumber = Number(el.sessionNumber);
				el.memUsage = Number(el.memUsage.replace(/[^\d]/g, '')) * 1024;
				el.cpuTime = sec(el.cpuTime);

				return el;
			});

			cb(null, data);
		});
	});
};
