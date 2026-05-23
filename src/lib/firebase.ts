import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDeUVBZY4FKblYU46Pfx7nMh7M6VVQzAMg",
  authDomain: "bst-sensor-monitoring.firebaseapp.com",
  databaseURL: "https://bst-sensor-monitoring-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bst-sensor-monitoring",
  storageBucket: "bst-sensor-monitoring.firebasestorage.app",
  messagingSenderId: "539907409966",
  appId: "1:539907409966:web:9586fe69fd9638fe77f7bf"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
