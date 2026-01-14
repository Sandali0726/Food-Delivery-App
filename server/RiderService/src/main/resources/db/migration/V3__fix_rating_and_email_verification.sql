-- Update existing null rating values to default value
UPDATE t_rider SET rating = 0.0 WHERE rating IS NULL;

-- Create email verification OTP table
CREATE TABLE IF NOT EXISTS x_email_verification_otp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    verified BOOLEAN NOT NULL DEFAULT false
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_email_verification_otp_email ON x_email_verification_otp(email);
CREATE INDEX IF NOT EXISTS idx_email_verification_otp_verified ON x_email_verification_otp(email, verified);
