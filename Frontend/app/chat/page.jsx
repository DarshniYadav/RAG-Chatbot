"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sendChatMessage, uploadDocument } from "../../lib/api";
import Sidebar from "../../components/Sidebar";
import ModelSelector from "../../components/ModelSelector";
import ChatWindow from "../../components/ChatWindow";
import ChatInput from "../../components/ChatInput";

const DEMO_SESSIONS = [
  { id: "s1", title: "Explain RAG architecture" },
  { id: "s2", title: "Next.js 14 App Router patterns" },
  { id: "s3", title: "Upload customer_data.pdf" },
  { id: "s4", title: "Zustand vs Redux Toolkit" },
];

export default function ChatPage() {
	const router = useRouter();
	const [sessions] = useState(DEMO_SESSIONS);
	const [activeSession, setActiveSession] = useState("s1");
	const [model, setModel] = useState("Enterprise RAG Model");
	const [conversationId, setConversationId] = useState("");
	const [messages, setMessages] = useState([
		{
			id: "m1",
			role: "user",
			content: "Explain RAG and how it works. Give me a simple code example using Python.",
		},
	]);
	const [loading, setLoading] = useState(false);
	const [token, setToken] = useState(null);
	const [uploading, setUploading] = useState(false);
	const [uploadMessage, setUploadMessage] = useState("");
	const [activeDocName, setActiveDocName] = useState("No document selected");
	const [activeSourceFile, setActiveSourceFile] = useState(null);
	const [userEmail, setUserEmail] = useState("");
	const isAuthenticated = Boolean(token);

	useEffect(() => {
		setToken(localStorage.getItem("rag_token"));
		const rawUser = localStorage.getItem("rag_user");
		if (rawUser) {
			try {
				const parsed = JSON.parse(rawUser);
				setUserEmail(parsed?.email || "");
			} catch {
				setUserEmail("");
			}
		}
	}, []);

	function handleLogout() {
		localStorage.removeItem("rag_token");
		localStorage.removeItem("rag_user");
		setToken(null);
		setUserEmail("");
		setConversationId("");
		setMessages([]);
		setActiveSourceFile(null);
		setUploadMessage("You are logged out.");
		router.push("/login");
	}

	async function handleUploadFile(file) {
		if (!token) {
			setUploadMessage("Please login first to upload documents.");
			return;
		}

		setUploading(true);
		setUploadMessage(`Uploading ${file.name}...`);

		try {
			const data = await uploadDocument(file, token);
			setActiveDocName(data?.filename || file.name);
			setActiveSourceFile(data?.source_file || null);
			setUploadMessage(`Uploaded ${data?.filename || file.name}. Embedding is processing.`);
		} catch (err) {
			setUploadMessage(err.message || "Upload failed. Please try again.");
		}
		finally {
			setUploading(false);
		}
	}

	async function handleSend(text) {
		if (!token) {
			setMessages((prev) => [
				...prev,
				{ id: `m-${Date.now()}-err`, role: "assistant", content: "Please login first to request backend responses." },
			]);
			return;
		}

		const userMessage = { id: `m-${Date.now()}-u`, role: "user", content: text };
		setMessages((prev) => [...prev, userMessage]);
		setLoading(true);

		try {
			const res = await sendChatMessage(
				text,
				conversationId || null,
				token,
				activeSourceFile,
				null,
			);
			if (!res.ok) {
				const raw = await res.text();
				throw new Error(raw || "Chat request failed");
			}
			const data = await res.json();
			if (data.conversation_id) {
				setConversationId(data.conversation_id);
			}
			setMessages((prev) => [
				...prev,
				{ id: `m-${Date.now()}-a`, role: "assistant", content: data.message || "No response generated." },
			]);
		} catch (err) {
			setMessages((prev) => [
				...prev,
				{ id: `m-${Date.now()}-e`, role: "assistant", content: `Error: ${err.message}` },
			]);
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="app-shell">
			<Sidebar
				sessions={sessions}
				activeId={activeSession}
				onSelect={(id) => setActiveSession(id)}
				onUploadFile={handleUploadFile}
				uploading={uploading}
				uploadMessage={uploadMessage}
				isAuthenticated={isAuthenticated}
				userEmail={userEmail}
				onLogout={handleLogout}
				onNewChat={() => {
					setConversationId("");
					setMessages([]);
				}}
			/>

			<section style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
				<ModelSelector model={model} onChange={setModel} />
				{!isAuthenticated ? (
					<div className="chat-auth-banner">
						<p className="chat-auth-text">
							You are in guest mode. Login or register to send prompts to the backend.
						</p>
						<div className="chat-auth-actions">
							<Link href="/login" className="chat-auth-btn-primary">Login</Link>
							<Link href="/register" className="chat-auth-btn-secondary">Create account</Link>
						</div>
					</div>
				) : null}
				<ChatWindow messages={messages} loading={loading} />
				<ChatInput onSend={handleSend} disabled={loading || !isAuthenticated} docName={activeDocName} />
			</section>
		</main>
	);
}
