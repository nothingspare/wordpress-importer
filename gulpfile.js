var gulp = require('gulp');
var argv = require('yargs').argv;
var Generator = require('sitemap-generator');
var parser = require('xml2json');
var process = require('process');
var _ = require('lodash');
var fs = require("fs");
var request = require('request');
var rp = require('request-promise');
var cheerio = require('cheerio');

gulp.task('map', function () {
	console.log('sitemap in progress: expecting --site http(s)://PREFIX.URL.TLD/');
	console.log(argv.site);
	var generator = Generator(argv.site, {
		stripQuerystring: false
	});

	generator.on('done', function (res) {
		console.log('done', res);
	});

	generator.start();
});

gulp.task('parse', function () {
	console.log('digest in progress: expecting --site http(s)://PREFIX.URL.TLD/');
	var siteBase = argv.site;
	var sitemap = fs.readFileSync('./sitemap.xml').toString();

	var json = JSON.parse(parser.toJson(sitemap));

	var pages = {};
	_.each(json.urlset.url, function (element, index) {
		var url = element.loc;
		var path = element.loc.replace(siteBase, '');
		var pathElements = path.split('/');
		pathElements.pop();

		if (pathElements.length) {
			pages[path] = {
				segments: pathElements,
				url: url,

				page: pathElements[pathElements.length-1]
			};
		}
	});

	console.log(pages);
	fs.writeFileSync('./sitemap.json', JSON.stringify(pages, null, 4));
});

gulp.task('rip', function () {
	var sitemap = fs.readFileSync('./sitemap.json').toString();
	var json = JSON.parse(sitemap);
	var selector = argv.selector;
	i = 0;
	_.each(json, function (details, page) {
		console.log(details.url);
		i = i + 1000;
		setTimeout(function () {
			rp(details.url)
				.then(function (resp) {
					var extensionParse = details.url.split('.');
					if (extensionParse > 1){
						fs.writeFileSync('./rip/' + details.page, resp);
					}
					else {
						var content = cheerio(resp).find(selector).html();
						fs.writeFileSync('./rip/' + details.page + '.html', content)
					}
				});
		}, i);
	});
	//request
});

gulp.task('push', function () {
	var sitemap = fs.readFileSync('./sitemap.json').toString();
	var json = JSON.parse(sitemap);

	var dest = argv.dest;
	var auth = argv.auth;
	console.log(dest, auth);
	i = 0;
	_.each(json, function (details, page) {
		var pageObj = {}
		try {
			var content = fs.readFileSync('./rip/' + details.page + '.html').toString();
		}
		catch (e) {
			console.log(e);
		}

		if (content) {
			pageObj = {
				title: details.page,
				status: 'publish',
				content: content
			};
			rp({
				method: 'POST',
				json: true,
				uri: dest,
				body: pageObj,
				headers: {
					'Authorization': 'Basic ' + auth,
					'Content-Type': 'application/json'
				}
			})
			.then(function (resp) {
				console.log(resp);
			});
		}
	});
});
