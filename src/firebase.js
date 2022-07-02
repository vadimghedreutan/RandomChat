import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
	apiKey: "AIzaSyCFtcrl3IZ4U4hM_NWSQg41ZqOTWBNBIcE",
	authDomain: "chat-public-2d625.firebaseapp.com",
	projectId: "chat-public-2d625",
	storageBucket: "chat-public-2d625.appspot.com",
	messagingSenderId: "24270202906",
	appId: "1:24270202906:web:906118d25c1a062a8bc9a3",
}

const app = initializeApp(firebaseConfig)

const db = getFirestore(app)
const auth = getAuth()
const provider = new GoogleAuthProvider()

export { db, auth, provider }
