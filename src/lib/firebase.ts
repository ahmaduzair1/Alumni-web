import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// TODO: Replace appId after registering a Web app in Firebase Console
// (Project settings → Your apps → Add app → Web). Use the generated config.
export const firebaseConfig = {
  apiKey: 'AIzaSyDtJCDfG8TuJemMaGCvCkQXnp3cdFix2e0',
  authDomain: 'alumni-connect-e4527.firebaseapp.com',
  projectId: 'alumni-connect-e4527',
  storageBucket: 'alumni-connect-e4527.firebasestorage.app',
  messagingSenderId: '1081880170959',
  appId: '1:1081880170959:web:alumniconnectweb',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
