import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, EmailAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Check if we have valid Firebase configuration
const hasValidFirebaseConfig = () => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  return apiKey && 
         projectId && 
         !apiKey.includes('your_') && 
         !apiKey.includes('Demo') &&
         apiKey !== 'your_firebase_api_key';
};

// Default configuration for development/demo mode
const defaultConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:demo-app-id",
  measurementId: "G-DEMO"
};

const firebaseConfig = hasValidFirebaseConfig() ? {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
} : defaultConfig;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to emulators in demo mode or development
const isDemo = !hasValidFirebaseConfig();
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDemo && isDevelopment && typeof window !== 'undefined') {
  // Connect to Firebase emulators
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('📱 Connected to Firebase emulators for demo mode');
  } catch (error) {
    console.log('⚡ Running in demo mode without emulators');
  }
}

// Auth providers
export const googleProvider = new GoogleAuthProvider();
export const emailProvider = new EmailAuthProvider();

// Messaging (for PWA push notifications)
let messaging: any = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  messaging = getMessaging(app);
}

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  if (!messaging) return null;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      });
      return token;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
  }
  return null;
};

// Listen for foreground messages
export const onMessageListener = () => {
  if (!messaging) return Promise.reject('Messaging not initialized');
  
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

// Connect to emulators in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectFunctionsEmulator(functions, 'localhost', 5001);
  } catch (error) {
    // Emulators already connected
  }
}

export { app };