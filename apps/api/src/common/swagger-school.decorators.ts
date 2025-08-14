import { ApiHeader, ApiQuery, ApiProperty } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

/**
 * Swagger decorator for X-School-Id header
 * Used to identify which school's data to access
 */
export function ApiSchoolHeader() {
  return applyDecorators(
    ApiHeader({
      name: 'X-School-Id',
      description: 'School identifier for multi-school data isolation',
      required: false,
      example: 'school-123',
    })
  );
}

/**
 * Swagger decorator for X-Tenant-Id header
 * Used to identify the parent organization/district
 */
export function ApiTenantHeader() {
  return applyDecorators(
    ApiHeader({
      name: 'X-Tenant-Id',
      description: 'Organization or school district identifier',
      required: false,
      example: 'district-456',
    })
  );
}

/**
 * Combined decorator for multi-school endpoints
 */
export function ApiMultiSchool() {
  return applyDecorators(
    ApiSchoolHeader(),
    ApiTenantHeader(),
  );
}

/**
 * Query parameter for filtering by school
 */
export function ApiSchoolQuery() {
  return ApiQuery({
    name: 'schoolId',
    required: false,
    description: 'Filter results by school',
    example: 'school-123',
  });
}

/**
 * DTO property decorator for schoolId
 */
export function ApiSchoolProperty(required = false) {
  return ApiProperty({
    description: 'School identifier',
    example: 'school-123',
    required,
  });
}