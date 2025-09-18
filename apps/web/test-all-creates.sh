#!/bin/bash

# Test script for all create endpoints in Paramarsh SMS
# Tests each entity's create endpoint with valid data

API_URL="http://localhost:3005/api/v1"
BRANCH_ID="dps-main"
RESULTS=()

echo "🧪 Testing All Create Flows"
echo "=========================="
echo ""

# Helper function to test endpoint
test_create() {
    local entity=$1
    local data=$2
    local name=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s -X POST "$API_URL/$entity" \
        -H "Content-Type: application/json" \
        -H "x-branch-id: $BRANCH_ID" \
        -d "$data" \
        -w "\n%{http_code}")
    
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)
    
    if [[ $http_code -eq 201 || $http_code -eq 200 ]]; then
        echo "✅ SUCCESS (HTTP $http_code)"
        RESULTS+=("✅ $name")
        # Extract ID if present for dependencies
        if [[ "$entity" == "students" ]]; then
            STUDENT_ID=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        elif [[ "$entity" == "classes" ]]; then
            CLASS_ID=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        elif [[ "$entity" == "sections" ]]; then
            SECTION_ID=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        elif [[ "$entity" == "teachers" ]]; then
            TEACHER_ID=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        fi
    else
        echo "❌ FAILED (HTTP $http_code)"
        echo "  Response: $(echo "$body" | head -c 200)"
        RESULTS+=("❌ $name (HTTP $http_code)")
    fi
}

# Test 1: Academic Year
test_create "academicYears" '{
    "name": "2024-25",
    "startDate": "2024-04-01",
    "endDate": "2025-03-31",
    "isActive": true
}' "Academic Year"

# Test 2: Class
test_create "classes" '{
    "name": "Class 10",
    "code": "C10",
    "description": "10th Standard",
    "gradeLevel": 10,
    "stream": "Science",
    "order": 10
}' "Class"

# Test 3: Section (needs classId)
if [[ -n "$CLASS_ID" ]]; then
    test_create "sections" "{
        \"name\": \"Section A\",
        \"classId\": \"$CLASS_ID\",
        \"capacity\": 30,
        \"roomNumber\": \"101\"
    }" "Section"
else
    echo "⏭️  Skipping Section (no classId)"
    RESULTS+=("⏭️  Section (dependency missing)")
fi

# Test 4: Teacher
test_create "teachers" '{
    "name": "Dr. Sharma",
    "email": "sharma.teacher@school.edu",
    "phoneNumber": "+91-9876543210",
    "employeeId": "T2024001",
    "department": "Science",
    "designation": "Senior Teacher",
    "qualification": "M.Sc, B.Ed",
    "experience": 10,
    "specialization": "Physics",
    "joiningDate": "2020-04-01",
    "address": "123 Teacher Colony, Delhi",
    "dob": "1985-01-15",
    "gender": "male"
}' "Teacher"

# Test 5: Student
test_create "students" '{
    "firstName": "Test",
    "lastName": "Student",
    "admissionNo": "TEST2024001",
    "dob": "2010-05-15",
    "gender": "male",
    "classId": "'${CLASS_ID:-"62675949-677b-4b9e-bf29-96e172ddb3ad"}'",
    "sectionId": "'${SECTION_ID:-"bda54c67-3e73-4fe9-b6cc-8e0d6fafdbd2"}'",
    "rollNumber": "99",
    "status": "active",
    "joiningDate": "2024-04-01",
    "address": "Test Address, Delhi",
    "bloodGroup": "O+",
    "parentContact": "+91-9876543210",
    "email": "test.student@example.com"
}' "Student"

# Test 6: Guardian (needs studentId)
if [[ -n "$STUDENT_ID" ]]; then
    test_create "guardians" "{
        \"studentId\": \"$STUDENT_ID\",
        \"name\": \"Mr. Test Guardian\",
        \"relation\": \"father\",
        \"phone\": \"+91-9876543211\",
        \"email\": \"guardian@example.com\",
        \"occupation\": \"Engineer\",
        \"address\": \"Guardian Address, Delhi\"
    }" "Guardian"
else
    echo "⏭️  Skipping Guardian (no studentId)"
    RESULTS+=("⏭️  Guardian (dependency missing)")
fi

# Test 7: Staff
test_create "staff" '{
    "name": "Mr. Admin Staff",
    "email": "admin.staff@school.edu",
    "phoneNumber": "+91-9876543212",
    "employeeId": "S2024001",
    "department": "Administration",
    "designation": "Office Manager",
    "joiningDate": "2020-04-01",
    "address": "Staff Quarters, Delhi",
    "role": "admin",
    "dob": "1980-06-20",
    "gender": "male"
}' "Staff"

# Test 8: Fee Structure
test_create "feeStructures" '{
    "name": "Class 10 Annual Fee",
    "classId": "'${CLASS_ID:-"62675949-677b-4b9e-bf29-96e172ddb3ad"}'",
    "academicYear": "2024-25",
    "components": [
        {"name": "Tuition Fee", "amount": 5000, "frequency": "monthly"},
        {"name": "Lab Fee", "amount": 2000, "frequency": "quarterly"},
        {"name": "Sports Fee", "amount": 1000, "frequency": "annual"}
    ],
    "totalAmount": 10000,
    "dueDate": "2024-04-10"
}' "Fee Structure"

# Test 9: Enrollment (needs studentId)
if [[ -n "$STUDENT_ID" ]]; then
    test_create "enrollments" "{
        \"studentId\": \"$STUDENT_ID\",
        \"classId\": \"${CLASS_ID:-"62675949-677b-4b9e-bf29-96e172ddb3ad"}\",
        \"sectionId\": \"${SECTION_ID:-"bda54c67-3e73-4fe9-b6cc-8e0d6fafdbd2"}\",
        \"academicYear\": \"2024-25\",
        \"enrollmentDate\": \"2024-04-01\",
        \"status\": \"active\"
    }" "Enrollment"
else
    echo "⏭️  Skipping Enrollment (no studentId)"
    RESULTS+=("⏭️  Enrollment (dependency missing)")
fi

# Test 10: Exam
test_create "exams" '{
    "name": "Mid-Term Exam",
    "type": "midterm",
    "classId": "'${CLASS_ID:-"62675949-677b-4b9e-bf29-96e172ddb3ad"}'",
    "startDate": "2024-10-01",
    "endDate": "2024-10-15",
    "totalMarks": 100,
    "passingMarks": 35,
    "status": "scheduled",
    "academicYear": "2024-25"
}' "Exam"

# Test 11: Invoice (needs studentId)
if [[ -n "$STUDENT_ID" ]]; then
    test_create "invoices" "{
        \"studentId\": \"$STUDENT_ID\",
        \"invoiceNumber\": \"INV2024001\",
        \"amount\": 5000,
        \"dueDate\": \"2024-12-31\",
        \"status\": \"pending\",
        \"items\": [
            {\"description\": \"Tuition Fee\", \"amount\": 5000}
        ],
        \"academicYear\": \"2024-25\"
    }" "Invoice"
else
    echo "⏭️  Skipping Invoice (no studentId)"
    RESULTS+=("⏭️  Invoice (dependency missing)")
fi

# Test 12: Payment (needs studentId)
if [[ -n "$STUDENT_ID" ]]; then
    test_create "payments" "{
        \"studentId\": \"$STUDENT_ID\",
        \"amount\": 5000,
        \"paymentDate\": \"2024-09-15\",
        \"paymentMethod\": \"online\",
        \"transactionId\": \"TXN2024001\",
        \"status\": \"completed\",
        \"academicYear\": \"2024-25\"
    }" "Payment"
else
    echo "⏭️  Skipping Payment (no studentId)"
    RESULTS+=("⏭️  Payment (dependency missing)")
fi

# Test 13: Attendance Record (needs studentId)
if [[ -n "$STUDENT_ID" ]]; then
    test_create "attendanceRecords" "{
        \"studentId\": \"$STUDENT_ID\",
        \"date\": \"2024-09-15\",
        \"status\": \"present\",
        \"classId\": \"${CLASS_ID:-"62675949-677b-4b9e-bf29-96e172ddb3ad"}\",
        \"sectionId\": \"${SECTION_ID:-"bda54c67-3e73-4fe9-b6cc-8e0d6fafdbd2"}\"
    }" "Attendance Record"
else
    echo "⏭️  Skipping Attendance (no studentId)"
    RESULTS+=("⏭️  Attendance (dependency missing)")
fi

# Test 14: Template
test_create "templates" '{
    "name": "Welcome Email",
    "type": "email",
    "subject": "Welcome to School",
    "content": "Dear {{name}}, Welcome to our school!",
    "variables": ["name"],
    "status": "active"
}' "Template"

# Test 15: Campaign
test_create "campaigns" '{
    "name": "New Academic Year",
    "type": "email",
    "subject": "Welcome to 2024-25",
    "content": "Welcome to the new academic year!",
    "audience": "all",
    "status": "draft",
    "scheduledDate": "2024-04-01T10:00:00Z"
}' "Campaign"

# Test 16: Message
test_create "messages" '{
    "type": "announcement",
    "subject": "School Holiday",
    "content": "School will remain closed tomorrow",
    "recipients": ["all"],
    "priority": "high",
    "sendDate": "2024-09-15T10:00:00Z"
}' "Message"

# Test 17: Ticket
test_create "tickets" '{
    "title": "Fee Payment Issue",
    "description": "Unable to pay fees online",
    "category": "payment",
    "priority": "high",
    "status": "open",
    "reportedBy": "Parent"
}' "Ticket"

# Test 18: Admission Application
test_create "admissionsApplications" '{
    "studentName": "New Applicant",
    "dob": "2010-01-15",
    "gender": "male",
    "classAppliedFor": "10",
    "previousSchool": "Previous School Name",
    "guardianName": "Mr. Guardian",
    "guardianPhone": "+91-9876543213",
    "guardianEmail": "guardian.new@example.com",
    "address": "Applicant Address, Delhi",
    "status": "pending",
    "applicationDate": "2024-09-15"
}' "Admission Application"

# Test 19: Marks (needs studentId and examId)
test_create "marks" '{
    "studentId": "'${STUDENT_ID:-"002c6dee-8eaa-475e-b44d-0ab01503ec05"}'",
    "examId": "exam123",
    "subject": "Mathematics",
    "marksObtained": 85,
    "totalMarks": 100,
    "grade": "A",
    "remarks": "Good performance"
}' "Marks"

echo ""
echo "=========================="
echo "📊 Test Results Summary"
echo "=========================="
echo ""

success_count=0
fail_count=0
skip_count=0

for result in "${RESULTS[@]}"; do
    echo "$result"
    if [[ "$result" == *"✅"* ]]; then
        ((success_count++))
    elif [[ "$result" == *"❌"* ]]; then
        ((fail_count++))
    elif [[ "$result" == *"⏭️"* ]]; then
        ((skip_count++))
    fi
done

echo ""
echo "------------------------"
echo "✅ Passed: $success_count"
echo "❌ Failed: $fail_count"
echo "⏭️  Skipped: $skip_count"
echo "------------------------"

if [[ $fail_count -eq 0 && $skip_count -eq 0 ]]; then
    echo "🎉 All tests passed!"
    exit 0
elif [[ $fail_count -eq 0 ]]; then
    echo "✨ All attempted tests passed (some skipped due to dependencies)"
    exit 0
else
    echo "⚠️  Some tests failed. Check the output above for details."
    exit 1
fi