// start_index is the index to start looking for the keys in the given string.
// It is not the index to start the keys at.
function generate(keys, start_index) {
	'use strict';

	// Convert array of strings to array of arrays of numbers.
	let codes = keys.map(key => [].map.call(key, c => c.charCodeAt(0)));

	// Generate trie as nested maps. NaN is used to mark the ends.
	function get_next(root, code, i) {
		let num = code[i];
		if (num === undefined) root.set(NaN, NaN);
		else root.set(num, get_next(root.has(num) ? root.get(num) : new Map(), code, i + 1));
		return root;
	}
	let trie = new Map();
	for (let code of codes) {
		let num = code[0];
		trie.set(num, get_next(trie.has(num) ? trie.get(num) : new Map(), code, 1));
	}

	// Convert trie to conditional statements.
	function to_conditional(root, i) {
		if (root.size === 1) {
			let [key,value] = root.entries().next().value;
			if (isNaN(key)) return [`return ${i};`];
			else return [
				`if (str.charCodeAt(${start_index+i}) === ${key}) {`,
					...to_conditional(value, i + 1).map(line => '\t' + line),
				'}'
			];
		} else {
			let has_end = false, lines = [`switch (str.charCodeAt(${start_index+i})) {`];
			for (let [code,value] of root) {
				if (isNaN(code)) has_end = true;
				else lines.push(
					`\tcase ${code}:`,
					...to_conditional(value, i + 1).map(line => '\t\t' + line),
					'\t\tbreak;'
				);
			}
			if (has_end) lines.push('\tdefault:', `\t\treturn ${i};`);
			lines.push('}');
			return lines;
		}
	}
	let code = to_conditional(trie, 0).join('\n');

	// New function returns the *length* of the found match. Since you already
	// have the original string and start position, you can find the actual
	// string yourself.
	return new Function('str', '"use strict;"\n\n' + code + '\n\nreturn 0;');
}
