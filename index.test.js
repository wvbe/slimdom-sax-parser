const { sync } = require('./index');

const xml = `
<?DOCTYPE html ?>
<!-- comment -->
<heck attrName="attrValue">skrrrah<![CDATA[<beep>]]></heck>
`;
it('synchronous parser', () => {
	const doc = sync(xml, true);
	expect(doc.lastChild.nodeName).toBe('heck');
	expect(doc.lastChild.getAttribute('attrName')).toBe('attrValue');
});
