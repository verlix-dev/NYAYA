// Shim for `next/server` so the API route handlers can be imported and
// exercised directly in the Node test runner, without bundling Next.js.
export class NextResponse extends Response {
  constructor(body, init) {
    super(body ?? null, init);
  }
  static json(body, init) {
    return new NextResponse(JSON.stringify(body), {
      ...init,
      headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
    });
  }
}

export class NextRequest extends Request {}