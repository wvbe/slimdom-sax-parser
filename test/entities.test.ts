import { sync } from '../src/index';

// fontoxpath playground:
// https://xpath.playground.fontoxml.com/?mode=0&variables=%7B%7D&xml=%3C%3Fxml+version%3D%221.0%22%3F%3E%0A%3C%21DOCTYPE+something+PUBLIC+%22-%2F%2Fexample+doctype%2F%2FEN%22+%22http%3A%2F%2Fwww.example.org%2Fns%22%3E%0A%3C%3Fpi-target+pi-data%3F%3E%0A%3C%21--+comment+--%3E%0A%3Croot+attr%3D%22val%22%3E%0A%09%3Ccontains-text%3Etext%3C%2Fcontains-text%3E%0A%09%3Ca%3Aroot+xmlns%3D%22http%3A%2F%2Fdefault%22+xmlns%3Aa%3D%22http%3A%2F%2Fa%22+xmlns%3Ab%3D%22http%3A%2F%2Fb%22+xmlns%3Ad%3D%22http%3A%2F%2Fd%22+a%3Aattr%3D%22A%22+b%3Aattr%3D%22B%22+attr%3D%22def%22%3E%0A%09%09%3Ca%3Achild+xmlns%3Ac%3D%22http%3A%2F%2Fa%22+xmlns%3Aa%3D%22http%3A%2F%2Fb%22+c%3Aattr%3D%22A%22+a%3Aattr%3D%22B%22+d%3Aattr%3D%22d%22+attr%3D%22def%22+%2F%3E%0A%09%09%3Ca%3Anext-sibling+a%3Aattr%3D%22AAA%22+%2F%3E%0A%09%3C%2Fa%3Aroot%3E%0A%09%3C%21%5BCDATA%5Bcdata%5D%5D%3E%0A%3C%2Froot%3E&xpath=%2F%2F*
const xml = `
	<root><a>&test1;</a></root>
`.trim();

it('entities in XML', () => {
	expect(() =>
		sync(`
	<!DOCTYPE book PUBLIC "-//OASIS//DTD DocBook XML V4.4//EN" "http://www.oasis-open.org/docbook/xml/4.4/docbookx.dtd" [
		<!ENTITY test1 "entity in XML">
	]>${xml}`)
	).toThrow(/undefined entity/);
});

it('entities passed to parser', () => {
	const doc = sync(xml, {
		additionalEntities: {
			test1: 'test completed'
		}
	});
	const subject = doc.documentElement?.firstChild?.firstChild;
	expect((subject?.nodeValue || '').trim()).toBe('test completed');
});
