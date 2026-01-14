# Email Verification Implementation (Pre-Registration)

This implementation adds pre-registration email verification functionality using OTP (One-Time Password). Users must verify their email BEFORE they can register.

## New Features Added

### 1. Email Verification Entity and Repository
- `emailVerificationOtp` entity for storing verification OTPs
- `emailVerificationOtpRepository` for database operations

### 2. Email Verification Service
- `emailVerificationService` for managing email verification process
- Sends OTP via email for pre-registration verification
- Validates OTP with attempt limiting (max 3 attempts)
- OTP expires in 10 minutes
- Tracks verification status

### 3. Pre-Registration Email Verification Flow
- Users must verify their email BEFORE registration
- Registration endpoint checks if email is verified
- Only verified emails are allowed to register

### 4. API Endpoints

#### Pre-Registration Email Verification Endpoints

**Send Email OTP (Before Registration)**
```
POST /api/auth/send-email-otp?email=user@example.com
```

**Verify Email OTP**
```
POST /api/auth/verify-email-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Resend Email OTP**
```
POST /api/auth/resend-email-otp?email=user@example.com
```

### 5. Updated Email Service
- Added `sendEmailVerificationOtp` method for sending verification emails
- Separate email templates for verification vs password reset

### 6. Security Updates
- Updated JWT filter to allow email verification endpoints
- Added password length validation (BCrypt 72-byte limit)
- Enhanced error handling with custom exceptions

### 7. Database Migration
- Created migration script to handle existing data
- Added email verification OTP table
- Fixed rating field null value issues

## Usage Flow

### Pre-Registration Email Verification Process
1. User requests OTP with `/api/auth/send-email-otp?email=user@example.com`
2. System checks if email already exists (rejects if exists)
3. System sends email verification OTP (valid for 10 minutes)
4. User verifies email using `/api/auth/verify-email-otp`
5. User can now register with verified email

### Registration Process
1. User attempts registration with `/api/auth/register`
2. System checks if email is verified
3. If not verified, registration is rejected with error message
4. If verified, normal registration proceeds

### Login Process
- Normal authentication (no email verification check during login)

### Resend OTP
- If OTP expires or gets lost, user can request new one
- Previous OTP attempts are reset when new OTP is requested

## Error Handling

The system handles various error cases:
- Email already registered (during OTP send)
- Email not verified (during registration)
- Invalid/expired OTP
- Too many failed attempts
- Already verified email
- Email not found
- OTP expired

## Configuration

### Email Configuration
Email settings are configured in `application.properties`:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### Database Migration
- Flyway is enabled to handle database schema updates
- Migration files handle existing data and new tables
- Rating field null values are automatically fixed

## Testing the Implementation

### 1. Send OTP for email verification
```bash
curl -X POST "http://localhost:8080/api/auth/send-email-otp?email=test@example.com"
```

### 2. Verify email with OTP from email
```bash
curl -X POST http://localhost:8080/api/auth/verify-email-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

### 3. Register user (only works after email verification)
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -F 'data={"email":"test@example.com","password":"password123","first_name":"Test","last_name":"User","phone_number":"1234567890","address":"Test Address","licence":"http://licence.com","vehicle_no":"ABC123"}' \
  -F 'file=@/path/to/image.jpg'
```

### 4. Login (normal flow)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Files Modified/Created

### New Files
- `model/emailVerificationOtp.java`
- `repository/emailVerificationOtpRepository.java`
- `service/emailVerificationService.java`
- `dto/emailVerificationDto.java`
- `exception/EmailNotVerifiedException.java`
- `config/PasswordConfig.java`
- `db/migration/V3__fix_rating_and_email_verification.sql`

### Modified Files
- `service/authService.java` - Removed automatic OTP sending
- `service/emailService.java` - Added verification email method
- `controller/authController.java` - Added pre-registration verification endpoints
- `config/JwtFilter.java` - Updated endpoint whitelist
- `resources/application.properties` - Enabled Flyway, updated file upload limits

## Key Differences from Post-Registration Verification

1. **Timing**: Email verification happens BEFORE registration, not after
2. **Registration Block**: Registration is blocked if email is not verified
3. **Login Flow**: Normal login without email verification checks
4. **User Experience**: Users verify email first, then register with confidence

The implementation ensures that only verified emails can create accounts, preventing fake registrations and ensuring email deliverability for future communications.
