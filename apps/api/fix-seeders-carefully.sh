#!/bin/bash

# List of seeders that still need fixing
seeders=(
  "ClassSubjectTeacherSeeder"
  "ExamSeeder"
  "ExamSessionSeeder"
  "FeeComponentSeeder"
  "FeeScheduleSeeder"
  "FeeStructureSeeder"
  "InvoiceSeeder"
  "MarkSeeder"
  "PaymentSeeder"
  "RoomSeeder"
  "StudentPeriodAttendanceSeeder"
  "TeacherAttendanceSeeder"
  "TeacherSeeder"
  "TenantSeeder"
  "TimetablePeriodSeeder"
  "SectionSeeder"
)

for seeder in "${seeders[@]}"; do
  file="src/seed/entities/${seeder}.ts"
  
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    
    # Fix metrics that are missing startTime/endTime
    sed -i '' 's/metrics: {$/metrics: {\
          startTime: new Date(startTime),\
          endTime: new Date(),/' "$file" 2>/dev/null || true
    
    # Fix metrics blocks that have duration but not startTime/endTime
    sed -i '' '/metrics: {/,/}/ {
      /startTime:/! {
        /totalRecords:/ {
          s/totalRecords:/startTime: new Date(startTime),\
          endTime: new Date(),\
          totalRecords:/
        }
      }
    }' "$file" 2>/dev/null || true
    
    # Convert string errors to Error objects
    sed -i '' "s/errors: errors\.length > 0 ? errors : undefined/errors: errors.length > 0 ? errors.map(e => typeof e === 'string' ? new Error(e) : e) : [],\n        warnings: []/" "$file" 2>/dev/null || true
    
    # Add data field where missing
    sed -i '' '/return {/,/};/ {
      /data:/! {
        /metrics:/ {
          a\
        data: [],
        }
      }
    }' "$file" 2>/dev/null || true
    
    # Fix catch blocks
    sed -i '' '/} catch (error) {/,/^  }$/ {
      /metrics: {/,/}/ {
        /startTime:/! {
          s/totalRecords:/startTime: new Date(startTime),\
          endTime: new Date(),\
          totalRecords:/
        }
      }
      /errors: \[/! {
        s/errors: .*/data: [],\
        errors: [new Error(`Critical error: ${error}`)],\
        warnings: []/
      }
    }' "$file" 2>/dev/null || true
  fi
done

echo "Done fixing seeders!"