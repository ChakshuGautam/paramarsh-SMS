// Minimal Data Provider compatible with shadcn-admin-kit (react-admin style)
// Maps list pagination/sort to page/pageSize/sort and reshapes { data, meta } → { data, total }

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Use Next.js API proxy to avoid CORS issues
const apiUrl = "/api/admin";

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    if (typeof window !== "undefined") {
      const clerk = (window as any).Clerk;
      if (clerk?.session?.getToken) {
        const token = await clerk.session.getToken();
        if (token) return { Authorization: `Bearer ${token}` };
      }
    }
  } catch {}
  const token =
    (typeof window !== "undefined"
      ? (window as unknown as { NEXT_PUBLIC_API_TOKEN?: string })
          .NEXT_PUBLIC_API_TOKEN
      : undefined) || process.env.NEXT_PUBLIC_API_TOKEN;
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

function getScopeHeaders(): Record<string, string> {
  const scope: { [k: string]: string | undefined } = {};
  
  // Get composite branch ID (e.g., "dps-main", "kvs-central")
  const branchId = typeof window !== "undefined" 
    ? localStorage.getItem('selectedBranchId') || 'dps-main'
    : 'dps-main';
  
  scope["X-Branch-Id"] = branchId;
  
  // Also send school and branch info separately if needed
  if (typeof window !== "undefined") {
    const schoolId = localStorage.getItem('selectedSchoolId');
    const branchName = localStorage.getItem('selectedBranchName');
    const schoolName = localStorage.getItem('selectedSchoolName');
    const branchDisplayName = localStorage.getItem('selectedBranchDisplayName');
    
    if (schoolId) scope["X-School-Id"] = schoolId;
    if (branchName) scope["X-Branch-Name"] = branchName;
    if (schoolName) scope["X-School-Name"] = schoolName;
    if (branchDisplayName) scope["X-Branch-Display-Name"] = branchDisplayName;
  }
  
  // Optional tenant ID
  const win = (typeof window !== "undefined" ? (window as unknown as any) : undefined) || {};
  const tenantId =
    win.NEXT_PUBLIC_TENANT_ID || process.env.NEXT_PUBLIC_TENANT_ID || undefined;
  if (tenantId) scope["X-Tenant-Id"] = String(tenantId);
  
  return scope as Record<string, string>;
}

async function http<T = unknown>(
  url: string,
  method: HttpMethod = "GET",
  body?: unknown
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(await getAuthHeader()),
      ...getScopeHeaders(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  // Handle empty responses (e.g., 204 No Content)
  if (res.status === 204) {
    return {} as T;
  }
  const text = await res.text();
  if (!text) {
    return {} as T;
  }
  return JSON.parse(text) as T;
}

function toQuery(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) {
      v.forEach((item) => sp.append(k, String(item)));
    } else {
      sp.set(k, String(v));
    }
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

type PaginationParams = { page?: number; perPage?: number; pageSize?: number };
type SortParams = { field?: string; order?: "ASC" | "DESC" | string };
type ListParams = {
  pagination?: PaginationParams;
  sort?: SortParams;
  filter?: Record<string, unknown>;
};

function mapListParams(resource: string, params: ListParams) {
  const path = resourceToPath(resource);
  const { pagination = {}, sort = {}, filter = {} } = params || {};
  const page = Number(pagination.page ?? 1);
  const pageSize = Number(pagination.perPage ?? pagination.pageSize ?? 10);
  const field = sort.field as string | undefined;
  const order = ((sort.order as string | undefined)?.toUpperCase() || "ASC") as
    | "ASC"
    | "DESC";
  const sortExpr = field ? (order === "DESC" ? `-${field}` : field) : undefined;

  // Flatten RA filter object into query params
  const filterQuery: Record<string, unknown> = {};
  if (filter && typeof filter === "object") {
    Object.entries(filter).forEach(([k, v]) => (filterQuery[k] = v as unknown));
  }

  const qs = toQuery({ page, pageSize, sort: sortExpr, ...filterQuery });
  const url = `${apiUrl}/${path}${qs}`;
  return url;
}

type ApiListResponse<T> = { data: T[]; meta?: { total?: number } };

function mapListResponse<T = unknown>(json: unknown) {
  const value = json as any;
  
  // React Admin expects { data: [], total: number }
  if (value && Array.isArray(value.data)) {
    return {
      data: value.data,
      total: value.total || value.meta?.total || value.data.length
    };
  }
  
  // Fallback for array responses
  if (Array.isArray(value)) {
    return { data: value, total: value.length };
  }
  
  return { data: [], total: 0 };
}

export const dataProvider = {
  async getList(
    resource: string,
    params: ListParams
  ): Promise<{ data: unknown[]; total: number }> {
    const url = mapListParams(resource, params);
    const json = await http<unknown>(url, "GET");
    return mapListResponse(json);
  },

  async getOne(
    resource: string,
    params: { id: string | number }
  ): Promise<{ data: unknown }> {
    const path = resourceToPath(resource);
    const url = `${apiUrl}/${path}/${params.id}`;
    const json = await http<unknown>(url, "GET");
    const data = (json as { data?: unknown })?.data ?? json;
    return { data };
  },

  async create(
    resource: string,
    params: { data: unknown }
  ): Promise<{ data: unknown }> {
    const path = resourceToPath(resource);
    const url = `${apiUrl}/${path}`;
    const json = await http<unknown>(url, "POST", params.data);
    const data = (json as { data?: unknown })?.data ?? json;
    return { data };
  },

  async update(
    resource: string,
    params: { id: string | number; data: unknown }
  ): Promise<{ data: unknown }> {
    const path = resourceToPath(resource);
    const url = `${apiUrl}/${path}/${params.id}`;
    // Prefer PATCH to align with spec
    const json = await http<unknown>(url, "PATCH", params.data);
    const data = (json as { data?: unknown })?.data ?? json;
    return { data };
  },

  async delete(
    resource: string,
    params: { id: string | number }
  ): Promise<{ data: unknown }> {
    const path = resourceToPath(resource);
    const url = `${apiUrl}/${path}/${params.id}`;
    const json = await http<unknown>(url, "DELETE");
    const data = (json as { data?: unknown })?.data ?? json;
    return { data };
  },

  async getMany(
    resource: string,
    params: { ids: Array<string | number> }
  ): Promise<{ data: unknown[] }> {
    // Robust fallback: fetch each id individually; ignore 404s to avoid hard failures on stale FKs
    const path = resourceToPath(resource);
    const results = await Promise.all(
      params.ids.map(async (id) => {
        try {
          return await http<unknown>(`${apiUrl}/${path}/${id}`, "GET");
        } catch (error) {
          const message = (error as Error)?.message || "";
          if (message.includes("HTTP 404")) {
            return null;
          }
          throw error;
        }
      })
    );
    const data = results
      .filter((json): json is unknown => json !== null)
      .map((json) => (json as { data?: unknown })?.data ?? json);
    return { data: data as unknown[] };
  },

  async getManyReference(
    resource: string,
    params: {
      target: string;
      id: string | number;
      pagination?: PaginationParams;
      sort?: SortParams;
      filter?: Record<string, unknown>;
    }
  ): Promise<{ data: unknown[]; total: number }> {
    const { target, id, pagination, sort, filter } = params;
    const url = mapListParams(resource, {
      pagination,
      sort,
      filter: { ...(filter || {}), [target]: id },
    });
    const json = await http<unknown>(url, "GET");
    return mapListResponse(json);
  },

  async updateMany(
    resource: string,
    params: { ids: Array<string | number>; data: unknown }
  ): Promise<{ data: Array<string | number> }> {
    const path = resourceToPath(resource);
    await Promise.all(
      params.ids.map((id) =>
        http(`${apiUrl}/${path}/${id}`, "PATCH", params.data)
      )
    );
    return { data: params.ids };
  },

  async deleteMany(
    resource: string,
    params: { ids: Array<string | number> }
  ): Promise<{ data: Array<string | number> }> {
    const path = resourceToPath(resource);
    await Promise.all(
      params.ids.map((id) => http(`${apiUrl}/${path}/${id}`, "DELETE"))
    );
    return { data: params.ids };
  },
};

export type DataProviderLike = typeof dataProvider;

// Map logical resource names to API paths
function resourceToPath(resource: string): string {
  const mapping: Record<string, string> = {
    // Core Academic
    students: "students",
    guardians: "guardians",
    classes: "classes",
    sections: "sections",
    enrollments: "enrollments",
    academicYears: "academic-years",
    
    // Admissions - Currently missing backend implementation
    admissionsApplications: "admissions/applications",
    applications: "admissions/applications",
    
    // Attendance - Fixed to match actual backend paths
    attendanceRecords: "attendance",
    attendanceSessions: "attendance-sessions",
    attendance: "attendance",
    teacherAttendance: "teacher-attendance", // Missing backend implementation
    
    // Exams & Marks
    exams: "exams",
    marks: "marks",
    
    // Fees & Payments
    feeStructures: "fee-structures",
    feeSchedules: "fee-schedules", 
    invoices: "invoices",
    payments: "payments",
    
    // HR & Staff
    staff: "staff",
    teachers: "teachers",
    
    // Timetable
    subjects: "subjects",
    rooms: "rooms",
    timetable: "timetable",
    timetablePeriods: "timetable/periods", // Missing backend implementation
    timetableGrid: "timetable/grid",
    timeSlots: "timeslots",
    timeslots: "timeslots",
    substitutions: "timetable/substitutions",
    sectionTimetables: "sections",
    timetables: "timetable",
    
    // Communications - Fixed to match actual backend paths
    templates: "templates",
    campaigns: "campaigns", 
    messages: "messages",
    preferences: "preferences",
    tickets: "tickets",
    
    // Files & Documents
    files: "files",
    
    // System
    tenants: "tenants",
    
    // Health check
    health: "health",
  };
  return mapping[resource] ?? resource;
}
