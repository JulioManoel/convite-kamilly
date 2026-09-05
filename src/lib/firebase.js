import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAg4dK3abXl9iBxozmnGEHwG79pxrsApXk',
  authDomain: 'convite-kamilly.firebaseapp.com',
  projectId: 'convite-kamilly',
  storageBucket: 'convite-kamilly.firebasestorage.app',
  messagingSenderId: '141663871296',
  appId: '1:141663871296:web:a613019fe5316759189aa5',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
