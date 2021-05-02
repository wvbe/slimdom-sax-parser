import { serializeToWellFormedString } from 'slimdom';
import { sync } from '../src/index';

function roundTrip(xml: string) {
	return serializeToWellFormedString(sync(xml));
}

describe('GitHub #7', () => {
	// Disabled this, because the bug is fixed
	xit('reproduced the issue', () => {
		expect(
			roundTrip(
				`
					<!DOCTYPE concept PUBLIC "-//OASIS//DTD DITA Concept//EN" "file:///W:/InfoShare/dita-oasis/1.2/technicalContent/dtd/concept.dtd"[]>
					<xml/>
				`.replace(/\n|\t/g, '')
			)
		).toBe(
			`
				<!DOCTYPE concept PUBLIC "-//OASIS//DTD DITA Concept//EN" ""file:///W:/InfoShare/dita-oasis/1.2/technicalContent/dtd/concept.dtd"[]">
				<xml/>
			`.replace(/\n|\t/g, '')
		);
	});
	it('fixed the issue', () => {
		expect(
			roundTrip(
				`
					<!DOCTYPE concept PUBLIC "-//OASIS//DTD DITA Concept//EN" "file:///W:/InfoShare/dita-oasis/1.2/technicalContent/dtd/concept.dtd"[]>
					<xml/>
				`.replace(/\n|\t/g, '')
			)
		).toBe(
			`
				<!DOCTYPE concept PUBLIC "-//OASIS//DTD DITA Concept//EN" "file:///W:/InfoShare/dita-oasis/1.2/technicalContent/dtd/concept.dtd">
				<xml/>
			`.replace(/\n|\t/g, '')
		);
	});
});

it('Roundtripping a PUBLIC doctype', () => {
	const xml = `
		<!DOCTYPE concept PUBLIC "-//OASIS//DTD DITA Concept//EN" "file:///W:/InfoShare/dita-oasis/1.2/technicalContent/dtd/concept.dtd">
		<xml/>
	`.replace(/\n|\t/g, '');
	expect(roundTrip(xml)).toBe(xml);
});

it('Roundtripping a SYSTEM doctype', () => {
	const xml = `
		<!DOCTYPE ARCXML SYSTEM "G:\\ArcIMS\\DTD\\arcxml.dtd">
		<xml/>
	`.replace(/\n|\t/g, '');
	expect(roundTrip(xml)).toBe(xml);
});
