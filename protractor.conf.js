exports.config = {
	framework: 'jasmine2',
	seleniumAddress: 'http://localhost:4444/wd/hub',
	specs: ['tests/protractor-*.js'],
	multiCapabilities: [
		{
			browserName: 'chrome'
		}
	],
	onPrepare: function() {
		var jasmineReporters = require('jasmine-reporters');
		var options = {
			consolidateAll: true,
			filePrefix: 'protractor-test-results'
		};
		jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter(options));
	}
}
