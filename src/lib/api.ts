import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message: string, status = 400, issues?: unknown) {
  return NextResponse.json({ error: { message, issues } }, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return fail('Validation failed', 422, error.issues);
  }

  if (error instanceof Error) {
    return fail(error.message, 400);
  }

  return fail('Unexpected error', 500);
}

export async function parseJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new Error('Invalid JSON payload');
  }
}
