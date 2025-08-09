import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ProblemDto } from './problem.dto';

export function ListDocs(summary = 'List resources') {
  return applyDecorators(
    ApiOkResponse({ description: summary }),
    ApiBadRequestResponse({ description: 'Invalid query', type: ProblemDto }),
  );
}

export function CreateDocs(summary = 'Create resource') {
  return applyDecorators(
    ApiCreatedResponse({ description: summary }),
    ApiBadRequestResponse({ description: 'Invalid request', type: ProblemDto }),
    ApiUnprocessableEntityResponse({ description: 'Validation error', type: ProblemDto }),
    ApiConflictResponse({ description: 'Conflict', type: ProblemDto }),
  );
}

export function UpdateDocs(summary = 'Update resource') {
  return applyDecorators(
    ApiOkResponse({ description: summary }),
    ApiBadRequestResponse({ description: 'Invalid request', type: ProblemDto }),
    ApiUnprocessableEntityResponse({ description: 'Validation error', type: ProblemDto }),
    ApiConflictResponse({ description: 'Conflict', type: ProblemDto }),
  );
}

export function DeleteDocs(summary = 'Delete resource') {
  return applyDecorators(
    ApiNoContentResponse({ description: summary }),
    ApiBadRequestResponse({ description: 'Invalid request', type: ProblemDto }),
  );
}
