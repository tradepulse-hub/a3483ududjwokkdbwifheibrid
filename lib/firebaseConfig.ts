// Firebase configuration
import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxEfk_I7xVlYP-Sd9UQvkBCGHZJDQcj-Y",
  authDomain: "worldappairdrop.firebaseapp.com",
  databaseURL: "https://worldappairdrop-default-rtdb.firebaseio.com",
  projectId: "worldappairdrop",
  storageBucket: "worldappairdrop.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

export { app, database }
