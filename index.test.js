const { sync } = require('./index');

it('synchronous parser', () => {
	const doc = sync('<heck attrName="attrValue" />', true);
	expect(doc.firstChild.nodeName).toBe('heck');
	expect(doc.firstChild.getAttribute('attrName')).toBe('attrValue');
});
