import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

// Register the ESM loader shim so the API route handlers can be imported
// directly in the Node test runner without bundling Next.js.
register('./test/loader.mjs', pathToFileURL('./'));