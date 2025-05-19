import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

// IMPORTANT: Ensure your Firebase environment variables are correctly set in your .env (or .env.local) file.
// These values (apiKey, authDomain, etc.) must come directly from your Firebase project settings.
// After updating your .env file, YOU MUST RESTART your Next.js development server for changes to take effect.
// If the error persists, double-check the following in your Firebase Console:
// 1. The API key is correct and has no typos.
// 2. The API key does not have restrictions that would prevent its use (e.g., HTTP referrers, API restrictions).
// 3. Firebase Authentication is enabled for your project, and the Email/Password sign-in provider is enabled.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);

export { app, auth };
