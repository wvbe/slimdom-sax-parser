/*
 * Split the doctype string
 * Thanks to https://github.com/jindw/xmldom
 */
function splitDoctypeDeclaration(source: string, start = 0) {
	let match;
	const buf = [];
	const reg = /'[^']+'|"[^"]+"|[^\s<>/=]+=?|(\/?\s*>|<)/g;
	reg.lastIndex = start;
	reg.exec(source); //skip <
	while ((match = reg.exec(source))) {
		buf.push(match[0]);
		if (match[1]) return buf;
	}
	return buf;
}

export function parseDoctypeDeclaration(source: string) {
	const [
		// @ts-ignore TS6133
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_opening,
		qualifiedName, // @ts-ignore TS6133
		type,
		publicIdOrSystemId,
		systemId
	] = splitDoctypeDeclaration(source);
	return type === 'PUBLIC'
		? {
				qualifiedName,
				publicId: publicIdOrSystemId.replace(/^"(.*)"$/, '$1'),
				systemId: systemId?.replace(/^"(.*)"$/, '$1') || null
		  }
		: {
				qualifiedName,
				publicId: null,
				systemId: publicIdOrSystemId.replace(/^"(.*)"$/, '$1')
		  };
}
