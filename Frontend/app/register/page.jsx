"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser } from "../../lib/api";
import AuthForm from "../../components/AuthForm";

export default function RegisterPage() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function onSubmit(e) {
		e.preventDefault();
		setMessage("");
		setError("");
		setLoading(true);
		try {
			await registerUser(name, email, password);
			const loginData = await loginUser(email, password);
			if (loginData?.access_token) {
				localStorage.setItem("rag_token", loginData.access_token);
			}
			setMessage("Registration successful. Redirecting to chat...");
			setTimeout(() => router.push("/chat"), 500);
		} catch (err) {
			if (err?.status === 400) {
				try {
					const loginData = await loginUser(email, password);
					if (loginData?.access_token) {
						localStorage.setItem("rag_token", loginData.access_token);
					}
					setMessage("Account already exists. Logged in successfully.");
					setTimeout(() => router.push("/chat"), 500);
					return;
				} catch {
					// Fall through to show the original registration error.
				}
			}

			setError(err.message || "Registration failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="auth-page">
			<div className="auth-stack">
				<AuthForm
					title="Create Account"
					subtitle="Start chatting with your documents"
					fields={[
						{ name: "name", type: "text", placeholder: "Name", autoComplete: "off" },
						{ name: "email", type: "email", placeholder: "Email", autoComplete: "off" },
						{ name: "password", type: "password", placeholder: "Password", autoComplete: "new-password" },
					]}
					values={{ name, email, password }}
					onChange={(field, value) => {
						if (field === "name") setName(value);
						if (field === "email") setEmail(value);
						if (field === "password") setPassword(value);
					}}
					onSubmit={onSubmit}
					submitText="Create account"
					loadingText="Creating account..."
					loading={loading}
					message={message}
					error={error}
				/>
				<p className="auth-switch-text">
					Already have an account? <Link href="/login" className="auth-switch-link">Sign in</Link>
				</p>
			</div>
		</main>
	);
}
