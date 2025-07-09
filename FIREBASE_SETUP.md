# 🔥 Firebase Setup Guide for TETRIX Contact Form

## 📋 **What You Need to Complete**

### **1. Get Your Web App Configuration**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `fir-rtc-7b55d`
3. Click the gear icon → **Project Settings**
4. Scroll down to **"Your apps"** section
5. Click **"Add app"** → **Web app** (</> icon)
6. Register app with name: "TETRIX Website"
7. Copy the configuration object

### **2. Update Your .env File**

Create a `.env` file in your project root with:

```env
FIREBASE_API_KEY=your_api_key_from_web_config
FIREBASE_AUTH_DOMAIN=fir-rtc-7b55d.firebaseapp.com
FIREBASE_PROJECT_ID=fir-rtc-7b55d
FIREBASE_STORAGE_BUCKET=fir-rtc-7b55d.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
```

### **3. Enable Firestore Database**

1. Go to Firebase Console → **Firestore Database**
2. Click **"Create Database"**
3. Choose **"Start in test mode"**
4. Select location (choose closest to Nigeria)
5. Click **"Done"**

### **4. Set Firestore Security Rules**

Go to Firestore Database → **Rules** and set:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /contact_submissions/{document} {
      allow read, write: if true; // For development
    }
  }
}
```

## 🚀 **How It Works**

1. **Form Submission**: User fills contact form → data sent to `/api/contact`
2. **API Processing**: Validates data → stores in Firestore collection `contact_submissions`
3. **Database Storage**: Each submission includes:
   - Name, Email, Message
   - Timestamp
   - Status (new/contacted)
4. **Admin Access**: View submissions at `/admin/contact-submissions`

## 📊 **Data Structure**

Each submission will be stored as:
```json
{
  "name": "John Doe",
  "email": "john.doe@tetrixcorp.com",
  "message": "Hello, I'm interested in your AI-powered data annotation services",
  "timestamp": "2024-07-20T10:30:00Z",
  "status": "new"
}
```

## 🔐 **Security Note**

The current setup allows public read/write access for development. For production:
- Add authentication to admin panel
- Implement proper security rules
- Use Firebase Auth for user management

## 📞 **Testing**

1. Start your dev server: `npm run dev`
2. Go to `/contact` and submit a test form
3. Check `/admin/contact-submissions` to see the data
4. Verify in Firebase Console → Firestore Database

## 🆘 **Troubleshooting**

- **"Firebase not initialized"**: Check your API key and configuration
- **"Permission denied"**: Update Firestore security rules
- **"Network error"**: Check internet connection and Firebase project status 

## Current Status ✅

Your Firebase configuration is **complete**! Here's what we have:

### ✅ Completed:
- Firebase project created: `fir-rtc-7b55d`
- Web API Key: `AIzaSyCAg70wIYtFwKDafodE6kkcRffuk0ewL5w`
- Project ID: `fir-rtc-7b55d`
- Project Number: `1073036366262`
- **App ID: `1:1073036366262:web:a76a0e270753f3e9497117`** ✅
- Environment variables configured in `.env`
- Firebase SDK installed (`firebase: ^11.9.1`)
- Contact form submission API endpoint created
- Admin panel for viewing submissions created
- Test page for verifying connection created

### ⚠️ **CRITICAL**: Enable Firestore Database

**Error Detected**: `PERMISSION_DENIED: Missing or insufficient permissions`

This error occurs because Firestore Database is not enabled in your Firebase project. Here's how to fix it:

## **Step 1: Enable Firestore Database**

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `fir-rtc-7b55d`
3. **Navigate to Firestore Database**: Click "Firestore Database" in the left sidebar
4. **Create Database**: Click "Create database"
5. **Choose Security Rules**: Select **"Start in test mode"** (for development)
6. **Select Location**: Choose a location closest to your users (e.g., `us-central1` for US)
7. **Click "Done"**

## **Step 2: Test the Connection**

After enabling Firestore, test your connection:

1. Visit: `http://localhost:4323/test-firebase`
2. You should see a green success message
3. The test will create a sample submission and retrieve it

## **Step 3: Test Contact Form**

1. Visit: `http://localhost:4323/contact`
2. Fill out and submit the contact form
3. Check the admin panel: `http://localhost:4323/admin/contact-submissions`

## Environment Variables ✅

Your `.env` file is now complete:

```env
FIREBASE_API_KEY=AIzaSyCAg70wIYtFwKDafodE6kkcRffuk0ewL5w
FIREBASE_AUTH_DOMAIN=fir-rtc-7b55d.firebaseapp.com
FIREBASE_PROJECT_ID=fir-rtc-7b55d
FIREBASE_STORAGE_BUCKET=fir-rtc-7b55d.appspot.com
FIREBASE_MESSAGING_SENDER_ID=1073036366262
FIREBASE_APP_ID=1:1073036366262:web:a76a0e270753f3e9497117
```

## File Structure

```
src/
├── lib/
│   └── firebase.js          # Firebase configuration and functions
├── pages/
│   ├── api/
│   │   └── contact.js       # API endpoint for form submissions
│   ├── admin/
│   │   └── contact-submissions.astro  # Admin panel
│   ├── contact.astro        # Contact form page
│   └── test-firebase.astro  # Firebase connection test
└── .env                     # Environment variables
```

## Testing Your Setup

1. **Test Firebase Connection**: Visit `/test-firebase`
2. **Test Contact Form**: Visit `/contact` and submit a form
3. **View Submissions**: Visit `/admin/contact-submissions`

## Security Considerations

- The current setup uses "test mode" for Firestore, which allows all reads/writes
- For production, you should set up proper security rules
- Consider adding authentication to the admin panel
- The API key is safe to expose in client-side code (it's designed for this)

## Troubleshooting

### Common Issues:

1. **"PERMISSION_DENIED: Missing or insufficient permissions"**
   - **Solution**: Enable Firestore Database in Firebase Console
   - Go to Firestore Database → Create database → Start in test mode

2. **"Firebase App named '[DEFAULT]' already exists"**
   - This is normal and can be ignored

3. **"Invalid API key" errors**
   - Verify your API key is correct
   - Make sure your Firebase project is active

4. **"App ID not found" errors**
   - Double-check your App ID in the .env file
   - Make sure you created a web app in Firebase Console

## Next Steps After Setup

1. **Add Authentication**: Implement user login for the admin panel
2. **Security Rules**: Set up proper Firestore security rules
3. **Email Notifications**: Add email notifications for new submissions
4. **Data Export**: Add functionality to export submissions to CSV
5. **Status Management**: Add ability to mark submissions as "contacted" or "resolved"

## Support

If you encounter any issues:
1. Check the test page at `/test-firebase` for specific error messages
2. Verify all environment variables are set correctly
3. Ensure Firestore is enabled in your Firebase project
4. Check the browser console for any JavaScript errors

## **IMPORTANT**: Production Security

Before going live:
1. Set up proper Firestore security rules
2. Add authentication to the admin panel
3. Consider rate limiting for the contact form
4. Set up email notifications for new submissions 