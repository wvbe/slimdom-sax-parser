import { expect, it, run } from 'https://deno.land/x/tincan/mod.ts';
import { parseDoctypeDeclaration } from '../src/parseDoctypeDeclaration.ts';
it('Can parse a PUBLIC doctype', () => {
	expect(
		parseDoctypeDeclaration(
			`<!DOCTYPE html PUBLIC
					"-//W3C//DTD XHTML 1.0 Transitional//EN"
					"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">`
		)
	).toEqual({
		qualifiedName: 'html',
		publicId: '-//W3C//DTD XHTML 1.0 Transitional//EN',
		systemId: 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'
	});
});
it('Can parse a SYSTEM doctype', () => {
	expect(
		parseDoctypeDeclaration(`<!DOCTYPE ARCXML SYSTEM "G:\\ArcIMS\\DTD\\arcxml.dtd"[]>`)
	).toEqual({
		qualifiedName: 'ARCXML',
		publicId: null,
		systemId: 'G:\\ArcIMS\\DTD\\arcxml.dtd'
	});
});

it('Can parse a PUBLIC doctype with an empty internal subsets declaration', () => {
	expect(
		parseDoctypeDeclaration(
			`<!DOCTYPE concept PUBLIC
					"-//OASIS//DTD DITA Concept//EN"
					"file:///W:/InfoShare/dita-oasis/1.2/technicalContent/dtd/concept.dtd"[]>`
		)
	).toEqual({
		qualifiedName: 'concept',
		publicId: '-//OASIS//DTD DITA Concept//EN',
		systemId: 'file:///W:/InfoShare/dita-oasis/1.2/technicalContent/dtd/concept.dtd'
	});
});

run();
