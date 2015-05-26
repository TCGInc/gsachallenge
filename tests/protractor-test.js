describe('GSA Challenge Demo App', function() {
	it('should have a title', function() {
		browser.get('http://gsachallenge.tcg.com/');
		expect(browser.getTitle()).toEqual('GSA Challenge');
	});
});
