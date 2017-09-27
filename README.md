# slimdom-sax-parser

> Parses XML to a Slimdom document using Sax

Limited functionality for now:

- Only synchronously
- Only elements, attributes and text nodes

## API

```
sync (xml: string, [strict: boolean, options: object]) : Document
```

For the `strict` and `options` arguments, please see the sax documentation: https://www.npmjs.com/package/sax
