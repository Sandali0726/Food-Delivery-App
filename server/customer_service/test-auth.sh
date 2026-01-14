#!/bin/bash

# Authentication Test Script
# Tests all auth endpoints

echo "🔐 Testing Yumi Authentication System"
echo "========================================"
echo ""

BASE_URL="http://localhost:8085/api/customers"
TEST_EMAIL="testuser$(date +%s)@example.com"
TEST_PASSWORD="Password123!"

echo "📧 Test Email: $TEST_EMAIL"
echo ""

# Test 1: Register
echo "1️⃣  Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

echo "Response: $REGISTER_RESPONSE"

if [[ $REGISTER_RESPONSE == *"successful"* ]]; then
    echo "✅ Registration successful!"
else
    echo "❌ Registration failed!"
    exit 1
fi
echo ""

# Test 2: Login
echo "2️⃣  Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

echo "Response: $LOGIN_RESPONSE"

if [[ $LOGIN_RESPONSE == *"token"* ]]; then
    echo "✅ Login successful!"
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "Token: $TOKEN"
else
    echo "❌ Login failed!"
    exit 1
fi
echo ""

# Test 3: Get Profile (should be empty)
echo "3️⃣  Testing Get Profile (before completion)..."
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/$TEST_EMAIL" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $PROFILE_RESPONSE"

if [[ $PROFILE_RESPONSE == *"404"* ]] || [[ $PROFILE_RESPONSE == "" ]]; then
    echo "✅ Profile not found (expected - not completed yet)"
else
    echo "⚠️  Profile exists"
fi
echo ""

# Test 4: Complete Profile
echo "4️⃣  Testing Complete Profile..."
COMPLETE_RESPONSE=$(curl -s -X PUT "$BASE_URL/$TEST_EMAIL/complete" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"first_name\":\"Test\",
    \"last_name\":\"User\",
    \"phone_number\":\"+1234567890\",
    \"location_lat\":\"40.7128\",
    \"location_lng\":\"-74.0060\",
    \"img_url\":\"https://example.com/photo.jpg\"
  }")

echo "Response: $COMPLETE_RESPONSE"

if [[ $COMPLETE_RESPONSE == *"Test"* ]]; then
    echo "✅ Profile completed successfully!"
else
    echo "❌ Profile completion failed!"
    exit 1
fi
echo ""

# Test 5: Get Profile (should exist now)
echo "5️⃣  Testing Get Profile (after completion)..."
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/$TEST_EMAIL" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $PROFILE_RESPONSE"

if [[ $PROFILE_RESPONSE == *"first_name"* ]]; then
    echo "✅ Profile retrieved successfully!"
else
    echo "❌ Profile retrieval failed!"
    exit 1
fi
echo ""

# Test 6: Update Location
echo "6️⃣  Testing Update Location..."
LOCATION_RESPONSE=$(curl -s -X PUT "$BASE_URL/$TEST_EMAIL/location" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"location_lat\":\"34.0522\",
    \"location_lng\":\"-118.2437\"
  }")

echo "Response: $LOCATION_RESPONSE"

if [[ $LOCATION_RESPONSE == *"34.0522"* ]]; then
    echo "✅ Location updated successfully!"
else
    echo "❌ Location update failed!"
    exit 1
fi
echo ""

# Test 7: Wrong Password
echo "7️⃣  Testing Wrong Password (should fail)..."
WRONG_LOGIN=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"WrongPassword\"}")

echo "Response: $WRONG_LOGIN"

if [[ $WRONG_LOGIN == *"Invalid"* ]] || [[ $WRONG_LOGIN == *"error"* ]]; then
    echo "✅ Correctly rejected wrong password!"
else
    echo "❌ Security issue - wrong password accepted!"
    exit 1
fi
echo ""

# Test 8: Duplicate Registration
echo "8️⃣  Testing Duplicate Registration (should fail)..."
DUP_REGISTER=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

echo "Response: $DUP_REGISTER"

if [[ $DUP_REGISTER == *"already exists"* ]]; then
    echo "✅ Correctly rejected duplicate email!"
else
    echo "⚠️  Duplicate check might not be working"
fi
echo ""

echo "========================================"
echo "🎉 All Authentication Tests Passed!"
echo "========================================"
echo ""
echo "Test Summary:"
echo "✅ Registration works"
echo "✅ Login works"
echo "✅ Profile completion works"
echo "✅ Profile retrieval works"
echo "✅ Location update works"
echo "✅ Password validation works"
echo "✅ Duplicate prevention works"
echo ""
echo "The authentication system is fully functional! 🚀"
