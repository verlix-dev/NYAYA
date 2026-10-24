export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'next/server' || specifier.endsWith('/next/server')) {
    const { pathToFileURL } = await import('node:url');
    return { url: pathToFileURL('./test/next-server-shim.mjs').href, shortCircuit: true };
  }
  return nextResolve(specifier, context, nextResolve);
}
export async function load(url, context, nextLoad) {
  const isShim = url.endsWith('/test/next-server-shim.mjs');
  if (isShim) {
    const { readFile } = await import('node:fs/promises');
    const source = await readFile(new URL(url), 'utf8');
    return { format: 'module', source, shortCircuit: true };
  }
  return nextLoad(url, context, nextLoad);
}
