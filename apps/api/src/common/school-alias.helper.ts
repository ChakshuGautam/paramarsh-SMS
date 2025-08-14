/**
 * Helper functions for aliasing between schoolId (API layer) and branchId (database layer)
 * 
 * This aliasing provides better clarity in the API where "school" is more intuitive
 * than "branch" for end users, while maintaining backward compatibility with the database.
 */

/**
 * Transform API request params to database params
 * Converts schoolId to branchId for database queries
 */
export function mapSchoolToDbParams(params: any): any {
  if (!params) return params;
  
  const mapped = { ...params };
  
  // Map schoolId to branchId
  if ('schoolId' in mapped) {
    mapped.branchId = mapped.schoolId;
    delete mapped.schoolId;
  }
  
  return mapped;
}

/**
 * Transform database response to API response
 * Converts branchId to schoolId for API responses
 */
export function mapDbToSchoolResponse<T extends Record<string, any>>(data: T): T {
  if (!data) return data;
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => mapDbToSchoolResponse(item)) as unknown as T;
  }
  
  // Handle objects
  if (typeof data === 'object') {
    const mapped = { ...data };
    
    // Map branchId to schoolId
    if ('branchId' in mapped) {
      (mapped as any).schoolId = mapped.branchId;
      delete mapped.branchId;
    }
    
    // Recursively map nested objects
    for (const key in mapped) {
      if (mapped[key] && typeof mapped[key] === 'object') {
        mapped[key] = mapDbToSchoolResponse(mapped[key]);
      }
    }
    
    return mapped as T;
  }
  
  return data;
}

/**
 * Decorator for service methods to automatically handle schoolId aliasing
 */
export function SchoolAlias() {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Map input parameters
      const mappedArgs = args.map(arg => 
        typeof arg === 'object' ? mapSchoolToDbParams(arg) : arg
      );
      
      // Call original method
      const result = await originalMethod.apply(this, mappedArgs);
      
      // Map response
      return mapDbToSchoolResponse(result);
    };

    return descriptor;
  };
}

/**
 * Extract schoolId from request headers or params
 * Looks for X-School-Id header or schoolId param
 */
export function extractSchoolId(request: any): string | undefined {
  return request.headers?.['x-school-id'] || 
         request.params?.schoolId || 
         request.query?.schoolId;
}