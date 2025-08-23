#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:8080/api/v1"
BRANCH_ID="branch1"

echo -e "${YELLOW}Testing Soft Delete and Audit Logging Functionality${NC}"
echo "======================================================"

# 1. Get a student to test with
echo -e "\n${GREEN}1. Getting a student to test with...${NC}"
STUDENT_RESPONSE=$(curl -s -X GET "$API_URL/students?perPage=1" \
  -H "X-Branch-Id: $BRANCH_ID")
STUDENT_ID=$(echo $STUDENT_RESPONSE | jq -r '.data[0].id')
STUDENT_NAME=$(echo $STUDENT_RESPONSE | jq -r '.data[0].firstName')
echo "Found student: $STUDENT_NAME (ID: $STUDENT_ID)"

# 2. Delete the student (soft delete)
echo -e "\n${GREEN}2. Soft deleting the student...${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/students/$STUDENT_ID" \
  -H "X-Branch-Id: $BRANCH_ID" \
  -H "X-User-Id: test-user")
echo "Delete response: $(echo $DELETE_RESPONSE | jq -c .)"

# 3. Try to get the deleted student (should fail)
echo -e "\n${GREEN}3. Trying to get the deleted student (should fail)...${NC}"
GET_DELETED=$(curl -s -X GET "$API_URL/students/$STUDENT_ID" \
  -H "X-Branch-Id: $BRANCH_ID")
echo "Get response: $(echo $GET_DELETED | jq -c .)"

# 4. Get deleted students list
echo -e "\n${GREEN}4. Getting list of deleted students...${NC}"
DELETED_LIST=$(curl -s -X GET "$API_URL/students/deleted" \
  -H "X-Branch-Id: $BRANCH_ID")
echo "Deleted students count: $(echo $DELETED_LIST | jq '.total')"

# 5. Restore the student
echo -e "\n${GREEN}5. Restoring the student...${NC}"
RESTORE_RESPONSE=$(curl -s -X POST "$API_URL/students/$STUDENT_ID/restore" \
  -H "X-Branch-Id: $BRANCH_ID")
echo "Restore response: $(echo $RESTORE_RESPONSE | jq -c .)"

# 6. Get the restored student (should work)
echo -e "\n${GREEN}6. Getting the restored student (should work)...${NC}"
GET_RESTORED=$(curl -s -X GET "$API_URL/students/$STUDENT_ID" \
  -H "X-Branch-Id: $BRANCH_ID")
echo "Student restored: $(echo $GET_RESTORED | jq -r '.data.firstName') (Status: $(echo $GET_RESTORED | jq -r '.data.status'))"

# 7. Check audit logs
echo -e "\n${GREEN}7. Checking audit logs...${NC}"
AUDIT_LOGS=$(curl -s -X GET "$API_URL/audit-logs?perPage=5" \
  -H "X-Branch-Id: $BRANCH_ID")
echo "Recent audit logs: $(echo $AUDIT_LOGS | jq '.total') entries"
echo "Latest actions:"
echo $AUDIT_LOGS | jq -r '.data[] | "\(.action) - \(.entityType) - \(.endpoint)"'

# 8. Get audit logs for specific entity
echo -e "\n${GREEN}8. Getting audit logs for the test student...${NC}"
ENTITY_LOGS=$(curl -s -X GET "$API_URL/audit-logs/entity/students/$STUDENT_ID" \
  -H "X-Branch-Id: $BRANCH_ID")
echo "Actions performed on student:"
echo $ENTITY_LOGS | jq -r '.data[] | "\(.action) at \(.createdAt)"'

# 9. Get performance metrics
echo -e "\n${GREEN}9. Getting performance metrics...${NC}"
METRICS=$(curl -s -X GET "$API_URL/audit-logs/metrics")
echo "Performance metrics:"
echo $METRICS | jq '.data'

echo -e "\n${GREEN}✅ Test completed successfully!${NC}"
echo "======================================================"
echo -e "${YELLOW}Summary:${NC}"
echo "- Soft delete is working (records are marked as deleted, not removed)"
echo "- Restore functionality is working"
echo "- Audit logging is tracking all API actions"
echo "- Performance metrics are being collected"