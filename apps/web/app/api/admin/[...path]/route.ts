import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:3005/api/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${BACKEND_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Forward Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Forward all X- headers (tenant, branch, school, etc.)
    request.headers.forEach((value, key) => {
      if (key.toLowerCase().startsWith('x-')) {
        headers[key] = value;
      }
    });
    
    // Ensure branch ID is always present (use default if not provided)
    if (!headers['x-branch-id'] && !headers['X-Branch-Id']) {
      headers['X-Branch-Id'] = 'dps-main';
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from backend' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const url = `${BACKEND_URL}/${path}`;

  try {
    const body = await request.json();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Forward all X- headers (tenant, branch, school, etc.)
    request.headers.forEach((value, key) => {
      if (key.toLowerCase().startsWith('x-')) {
        headers[key] = value;
      }
    });
    
    // Ensure branch ID is always present (use default if not provided)
    if (!headers['x-branch-id'] && !headers['X-Branch-Id']) {
      headers['X-Branch-Id'] = 'dps-main';
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from backend' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const url = `${BACKEND_URL}/${path}`;

  try {
    const body = await request.json();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Forward all X- headers (tenant, branch, school, etc.)
    request.headers.forEach((value, key) => {
      if (key.toLowerCase().startsWith('x-')) {
        headers[key] = value;
      }
    });
    
    // Ensure branch ID is always present (use default if not provided)
    if (!headers['x-branch-id'] && !headers['X-Branch-Id']) {
      headers['X-Branch-Id'] = 'dps-main';
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from backend' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const url = `${BACKEND_URL}/${path}`;

  try {
    const body = await request.json();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Forward all X- headers (tenant, branch, school, etc.)
    request.headers.forEach((value, key) => {
      if (key.toLowerCase().startsWith('x-')) {
        headers[key] = value;
      }
    });
    
    // Ensure branch ID is always present (use default if not provided)
    if (!headers['x-branch-id'] && !headers['X-Branch-Id']) {
      headers['X-Branch-Id'] = 'dps-main';
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from backend' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const url = `${BACKEND_URL}/${path}`;

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Forward Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Forward all X- headers (tenant, branch, school, etc.)
    request.headers.forEach((value, key) => {
      if (key.toLowerCase().startsWith('x-')) {
        headers[key] = value;
      }
    });
    
    // Ensure branch ID is always present (use default if not provided)
    if (!headers['x-branch-id'] && !headers['X-Branch-Id']) {
      headers['X-Branch-Id'] = 'dps-main';
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    // Handle empty responses
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from backend' },
      { status: 500 }
    );
  }
}