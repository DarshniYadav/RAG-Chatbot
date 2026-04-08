import Link from "next/link";

export default function HomePage() {
	return (
		<main className="auth-page">
			<div className="auth-stack">
				<div className="auth-card">
					<h1 className="auth-title">RAG Chatbot</h1>
					<p className="auth-subtitle">
						Login or create an account to start chatting with your documents.
					</p>
					<div className="chat-auth-actions" style={{ marginTop: 8 }}>
						<Link href="/login" className="chat-auth-btn-primary">Login</Link>
						<Link href="/register" className="chat-auth-btn-secondary">Register</Link>
					</div>
					<p className="auth-switch-text" style={{ marginTop: 14 }}>
						Or continue to <Link href="/chat" className="auth-switch-link">chat</Link> in guest mode.
					</p>
				</div>
			</div>
		</main>
	);
}
