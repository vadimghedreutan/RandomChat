import React, { useState, useEffect } from "react"
import { IoMdSend } from "react-icons/io"
import { IoLogoWechat } from "react-icons/io5"
import moment from "moment"

import {
	addDoc,
	collection,
	query,
	orderBy,
	serverTimestamp,
	onSnapshot,
} from "firebase/firestore"

import { useAuthState } from "react-firebase-hooks/auth"

import { auth, provider, db } from "./firebase"
import { signInWithPopup } from "firebase/auth"

function App() {
	const [user, loading] = useAuthState(auth)

	if (loading) return <Loading />

	return (
		<>
			<div>{user ? <ChatRoom /> : <SignIn />}</div>
		</>
	)
}

function Loading() {
	return (
		<div className="flex justify-center w-full h-full fixed">
			<div className="spinner">
				<div className="rect"></div>
				<div className="rect2"></div>
				<div className="rect3"></div>
				<div className="rect3"></div>
				<div className="rect4"></div>
			</div>
		</div>
	)
}

function SignIn() {
	const signIn = () => {
		signInWithPopup(auth, provider)
			.then((result) => {
				// This gives you a Google Access Token. You can use it to access the Google API.
				// const credential = GoogleAuthProvider.credentialFromResult(result);
				// const token = credential.accessToken;
				// The signed-in user info.
				// const user = result.user;
				// ...
			})
			.catch((error) => {
				// Handle Errors here.
				const errorCode = error.code
				const errorMessage = error.message
				// The email of the user's account used.
				const email = error.email
				// The AuthCredential type that was used.
				// const credential = GoogleAuthProvider.credentialFromError(error);
				// ...
			})
	}
	return (
		<div className="max-w-7xl mx-auto">
			<div className="grid">
				<div className="flex items-center justify-between p-5">
					<h1 className="text-xl font-semibold">Chat App</h1>
					<button
						onClick={signIn}
						className="bg-white w-[100px] h-[100px] rounded-full flex justify-center items-center font-bold text-gray-900 cursor-pointer"
					>
						Sign In
					</button>
				</div>
				<div className="flex justify-center items-center p-3">
					<img src="/chat.svg" alt="" />
				</div>
			</div>
		</div>
	)
}

function SignOut() {
	return (
		auth.currentUser && (
			<button className="sign-out" onClick={() => auth.signOut()}>
				Sign Out
			</button>
		)
	)
}

function ChatRoom() {
	const [data, setData] = useState([])
	const [user] = useAuthState(auth)

	useEffect(() => {
		const q = query(collection(db, "messages"), orderBy("timestamp", "asc"))
		const unsub = onSnapshot(q, (snapshot) => {
			setData(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
		})
		return unsub
	}, [])

	const [formValue, setFormValue] = useState("")

	const sendMessage = async (e) => {
		e.preventDefault()
		const { uid, photoURL, email } = auth.currentUser

		try {
			await addDoc(collection(db, "messages"), {
				text: formValue,
				uid,
				photoURL,
				email,
				timestamp: serverTimestamp(),
			})

			setFormValue("")
		} catch (err) {
			console.log("Connection db faild", err)
		}
	}

	return (
		<div className="grid">
			<header className="p-5 flex justify-between bg-blue-900">
				<div className="flex items-center space-x-2">
					<IoLogoWechat className="h-10 w-10" />
					<h1 className="font-semibold">Public chat</h1>
				</div>
				<div className="flex items-center space-x-4">
					<div className="flex items-center space-x-2">
						<img
							src={user.photoURL}
							alt=""
							referrerPolicy="no-referrer"
							className="h-8 w-8 rounded-full object-cover"
						/>
						<span className="hidden sm:inline-flex">
							{user.email}
						</span>
					</div>
					<SignOut />
				</div>
			</header>
			{/* msg container */}
			<div className="overflow-y-scroll flex flex-col p-5">
				{data.map((msg) => (
					<ChatMessage
						key={msg.id}
						message={{
							...msg,
							timestamp: msg.timestamp?.toDate().getTime(),
						}}
						user={msg.email}
					/>
				))}
			</div>
			<div className="flex items-center justify-around gap-4 p-5 bg-blue-900">
				{/* form box */}
				<form
					onSubmit={sendMessage}
					className="flex items-center w-full space-x-4"
				>
					<input
						type="text"
						value={formValue}
						onChange={(e) => setFormValue(e.target.value)}
						className="outline-0 border-0 rounded-3xl p-3 text-gray-900 w-full"
					/>

					<button type="submit">
						<IoMdSend className="w-8 h-8" />
					</button>
				</form>
			</div>
		</div>
	)
}

function ChatMessage(props) {
	const { id, text, timestamp, email } = props.message
	const [userLoggedIn] = useAuthState(auth)

	return (
		<div className="flex mb-4">
			{email === userLoggedIn.email ? (
				<div
					className="bg-white rounded-full text-gray-900 text-left"
					key={id}
				>
					<div className="flex items-center space-x-2 w-fit py-1 px-3">
						<span className="text-sm">{text},</span>
						<span className="text-xs">
							{timestamp
								? moment(timestamp).format("LT")
								: "Just now"}
						</span>
					</div>
				</div>
			) : (
				<div className="ml-auto bg-blue-500 rounded-full text-white">
					<div className="flex items-center space-x-2 w-fit py-1 px-3">
						<span className="text-sm">{text},</span>
						<span className="text-xs">
							{timestamp
								? moment(timestamp).format("LT")
								: "Just now"}
						</span>
					</div>
				</div>
			)}
		</div>
	)
}

export default App
