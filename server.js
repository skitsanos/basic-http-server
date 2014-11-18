/**
 * basic-http-server
 * Created by skitsanos on 10/07/2014.
 */

String.prototype.replaceAll = function (f, r)
{
	return this.replace(new RegExp(f, 'g'), r);
};

String.prototype.mid = function (start, len)
{
	if (start < 0 || len < 0) return "";
	var iEnd, iLen = String(this).length;
	if (start + len > iLen)
	{
		iEnd = iLen;
	}
	else
	{
		iEnd = start + len;
	}
	return String(this).substring(start, iEnd);
};

var fs = require('fs');
var http = require('http');
var url = require('url');
var mime = require('mime');

http.createServer(function (request, response)
{
	var urlParts = url.parse(request.url, true);

	//Application handlers
	var app = {
		api: {},

		config: {},

		io: {
			basedir: function ()
			{
				return __dirname;
			},

			readFile: function (path, options)
			{
				return fs.readFileSync(path);
			},

			fileExists: function (path)
			{
				return fs.existsSync(path);
			},

			fileExtension: function (filename)
			{
				var ext = path.extname(filename || '').split('.');
				return ext[ext.length - 1];
			}
		},

		utils: {
			serveContent: function (path, contentType)
			{
				var body = app.io.readFile(path);
				response.writeHead(200, {
					'Content-Length': body.length,
					'Content-Type': contentType
				});
				response.write(body);
				response.end();
			},

			serveRAW: function (data, contentType)
			{
				response.writeHead(200, {
					'Content-Type': contentType
				});
				response.write(data);
				response.end();
			},

			serveJson: function (type, content)
			{
				app.utils.serveRAW(JSON.stringify({type: type, result: content}), 'application/json');
			},

			serveError: function (code, message)
			{
				response.writeHead(code, {
					'Content-Length': message.length,
					'Content-Type': 'text/html'
				});
				response.write(message);
				response.end();
			},

			getRandomPassword: function (length)
			{
				var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
				var pass = '';
				for (var i = 0; i < length; ++i)
				{
					var x = Math.floor(Math.random() * 62);
					pass += chars.charAt(x);
				}
				return pass;
			}
		}
	};

	try
	{
		if (request.url == '/')
		{
			app.utils.serveContent(app.io.basedir() + '/index.html', 'text/html');
		}
		else
		{
			app.utils.serveContent(app.io.basedir() + request.url, mime.lookup(request.url));
		}
	}
	catch (ex)
	{
		console.log('Not found: ' + __dirname + request.url);
		app.utils.serveError('404', 'Not found');
	}

}).listen(process.env.PORT || process.env.VMC_APP_PORT || 1337, null);

console.log('basic-http-server is up and running');
