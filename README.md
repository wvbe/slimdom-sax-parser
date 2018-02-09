# slimdom-sax-parser

> Parses XML to a [slimdom](https://www.npmjs.com/package/slimdom) document using [sax](https://www.npmjs.com/package/sax).

Works in browsers and NodeJS. Includes (namespaced) elements, (namespaced) attributes, processing instructions, comments and CDATA.

## It's extremely easy to use

The only argument is a string of well-formed XML.

```
import parser from 'slimdom-sax-parser';

const document = parser.sync('<example></example>');
```

## @TODO:

- The streaming version
