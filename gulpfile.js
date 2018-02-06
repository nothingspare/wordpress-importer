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

gulp.task('export', function () {
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

gulp.task('digest', function () {
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
	// console.log(json);
	i = 0;
	_.each(json, function (details, page) {
		i++;
		if (i > 1) {
			return;
		}
		console.log(details.url);
		rp(details.url)
			.then(function (resp) {
				var content = cheerio(resp).find('#inner').html()
				console.log(content);
			});
	});
	//request
});

gulp.task('import', function () {});