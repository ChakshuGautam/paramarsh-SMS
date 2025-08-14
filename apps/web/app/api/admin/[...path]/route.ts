import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000/api/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${BACKEND_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Forward tenant/branch headers if present
    const tenantId = request.headers.get('X-Tenant-Id');
    const branchId = request.headers.get('X-Branch-Id');
    
    if (tenantId) headers['X-Tenant-Id'] = tenantId;
    if (branchId) headers['X-Branch-Id'] = branchId;

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
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const url = `${BACKEND_URL}/${path}`;

  try {
    const body = await request.json();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Forward tenant/branch headers if present
    const tenantId = request.headers.get('X-Tenant-Id');
    const branchId = request.headers.get('X-Branch-Id');
    
    if (tenantId) headers['X-Tenant-Id'] = tenantId;
    if (branchId) headers['X-Branch-Id'] = branchId;

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
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const url = `${BACKEND_URL}/${path}`;

  try {
    const body = await request.json();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Forward tenant/branch headers if present
    const tenantId = request.headers.get('X-Tenant-Id');
    const branchId = request.headers.get('X-Branch-Id');
    
    if (tenantId) headers['X-Tenant-Id'] = tenantId;
    if (branchId) headers['X-Branch-Id'] = branchId;

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
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const url = `${BACKEND_URL}/${path}`;

  try {
    const body = await request.json();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Forward tenant/branch headers if present
    const tenantId = request.headers.get('X-Tenant-Id');
    const branchId = request.headers.get('X-Branch-Id');
    
    if (tenantId) headers['X-Tenant-Id'] = tenantId;
    if (branchId) headers['X-Branch-Id'] = branchId;

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
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const url = `${BACKEND_URL}/${path}`;

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Forward tenant/branch headers if present
    const tenantId = request.headers.get('X-Tenant-Id');
    const branchId = request.headers.get('X-Branch-Id');
    
    if (tenantId) headers['X-Tenant-Id'] = tenantId;
    if (branchId) headers['X-Branch-Id'] = branchId;

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