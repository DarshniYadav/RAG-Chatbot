"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../../lib/api";
import AuthForm from "../../components/AuthForm";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function onSubmit(e) {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const data = await loginUser(email, password);
			if (data?.access_token) {
				localStorage.setItem("rag_token", data.access_token);
			}
			router.push("/chat");
		} catch (err) {
			setError(err.message || "Login failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="auth-page">
			<div className="auth-stack">
				<AuthForm
					title="Welcome Back"
					subtitle="Sign in to your RAG workspace"
					fields={[
						{ name: "email", type: "email", placeholder: "Email" },
						{ name: "password", type: "password", placeholder: "Password" },
					]}
					values={{ email, password }}
					onChange={(name, value) => {
						if (name === "email") setEmail(value);
						if (name === "password") setPassword(value);
					}}
					onSubmit={onSubmit}
					submitText="Sign in"
					loadingText="Signing in..."
					loading={loading}
					error={error}
				/>
				<p className="auth-switch-text">
					No account yet? <Link href="/register" className="auth-switch-link">Create one</Link>
				</p>
			</div>
		</main>
	);
}
