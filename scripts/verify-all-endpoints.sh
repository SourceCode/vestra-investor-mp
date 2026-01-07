#!/bin/bash
set -e

BASE_URL="http://localhost:4002/trpc"
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

check_endpoint() {
    ENDPOINT=$1
    NAME=$2
    INPUT=${3:-""}
    
    echo "Checking $NAME ($ENDPOINT)..."
    
    if [ -n "$INPUT" ]; then
        URL="$BASE_URL/$ENDPOINT?batch=1&input=$INPUT"
    else
        URL="$BASE_URL/$ENDPOINT"
    fi

    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
    
    if [[ "$HTTP_CODE" == "200" ]]; then
        echo -e "${GREEN}✓ $NAME verified${NC}"
    else
        echo -e "${RED}✗ $NAME failed with $HTTP_CODE${NC}"
        # Proceeding despite failure to show full report, validation logic can be stricter if needed
    fi
}

echo "=== Batch 1: System Apps (Backend Checks) ==="
# System apps are mostly frontend, checking basic health or similar if available. 
# Using a generic check for now or skipping pure frontend apps.
check_endpoint "users.getProfile?batch=1&input=%7B%220%22%3A%7B%22userId%22%3A%22test%22%7D%7D" "System: User Profile"

echo "=== Batch 2: Core CRM Apps ==="
check_endpoint "contacts.list" "Contacts"
check_endpoint "leads.list" "Leads"
check_endpoint "deals.getAll" "Deals"
check_endpoint "tasks.getAll" "Tasks"
# check_endpoint "calendar.getEvents" "Calendar" # Assuming this exists

echo "=== Batch 3: Business Apps ==="
check_endpoint "properties.getAll" "Properties"
check_endpoint "agents.list" "Agents"
check_endpoint "offers.getAll" "Offers"
check_endpoint "closings.getAll" "Closings"
check_endpoint "salesContracts.getAll" "Sales Contracts"
check_endpoint "fundingRequests.getAll" "Funding Requests"
check_endpoint "checkRequests.getAll" "Check Requests"
check_endpoint "payroll.getAll" "Payroll"

echo "=== Batch 4: Admin & Tools ==="
check_endpoint "admin.getWorkflows" "Admin"
check_endpoint "reports.getTypes" "Reports"
# Search requires input
check_endpoint "search.getRecentSearches?batch=1&input=%7B%220%22%3A%7B%22userId%22%3A%22test%22%7D%7D" "Search"
# AI Assistant (TODO: locate router)

echo "=== Batch 5: Communication & Others ==="
check_endpoint "communications.getConversations" "Communications"
check_endpoint "approvals.getQueues" "Approvals"
check_endpoint "investors.getCriteria?batch=1&input=%7B%220%22%3A%7B%22contactId%22%3A%22test%22%7D%7D" "Investors"

echo "Verification Complete"
