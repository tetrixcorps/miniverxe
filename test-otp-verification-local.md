# Local OTP Verification Testing Guide

## Prerequisites
- ✅ Dependencies installed (`node_modules` exists)
- ✅ Fixed files in place:
  - `src/pages/api/v2/2fa/verify.ts` (5-digit code validation)
  - `src/components/auth/UnifiedAuthModal.astro` (improved error handling)

## Testing Steps

### 1. Start the Dev Server
```bash
pnpm dev
```

The server should start on `http://localhost:4321` (or the port shown in terminal)

### 2. Open the Application
- Navigate to `http://localhost:4321`
- Click on "Client Login" or any button that opens the authentication modal

### 3. Test OTP Verification Flow

#### Step 1: Enter Phone Number
- Enter a valid phone number (e.g., +15042749808)
- Click "Continue"

#### Step 2: Request OTP Code
- Select a verification method (SMS, Voice, WhatsApp, Flash Call)
- Click the send button
- **Expected**: "Verification SMS sent successfully" message
- **Check Console**: Look for logs showing verification initiated

#### Step 3: Enter Verification Code
- Enter the **5-digit code** you received
- Click "Verify Code"
- **Expected Behavior**:
  - ✅ Code is accepted (5 digits)
  - ✅ Verification succeeds
  - ✅ User is redirected to dashboard

### 4. Check Browser Console

Open DevTools (F12) and look for:
- `✅ Verify code button found, attaching handler` - Handler attached successfully
- `🔍 Verify code button clicked` - Button click detected
- `🔍 OTP verification attempt:` - Shows code validation
- Any error messages if something fails

### 5. Test Error Cases

#### Test 1: Invalid Code Length
- Enter 4 digits → Should show error: "Please enter 1 more digit..."
- Enter 6 digits → Should show error: "Please enter a valid 5-digit code"

#### Test 2: Invalid Code
- Enter wrong 5-digit code → Should show: "Invalid verification code"

#### Test 3: Missing Input
- Leave code empty → Should show: "Please enter a valid 5-digit code"

## Expected Console Logs

When clicking "Verify Code", you should see:
```
✅ Verify code button found, attaching handler
🔍 Verify code button clicked
🔍 OTP verification attempt: {
  rawCode: "...",
  cleanedCode: "12345",
  length: 5,
  inputElement: "unified-verification-code",
  verificationId: "..."
}
```

## Troubleshooting

### Issue: Button handler not working
- **Check**: Console for "❌ unified-verify-code-btn not found"
- **Fix**: Ensure modal is properly initialized

### Issue: Code validation fails
- **Check**: Console logs for code length
- **Verify**: Backend accepts 5 digits (check `src/pages/api/v2/2fa/verify.ts`)

### Issue: Backend proxy errors
- **Check**: If `BACKEND_URL` is set in `.env`, backend must be running
- **Option**: Remove `BACKEND_URL` from `.env` to use local service

## Success Criteria

✅ OTP code (5 digits) is accepted  
✅ Verification succeeds with correct code  
✅ Error messages show for invalid codes  
✅ Console logs show proper handler attachment  
✅ No JavaScript errors in console

