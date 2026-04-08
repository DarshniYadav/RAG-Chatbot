"use client";

import { useState } from "react";

export default function ChatInput({ onSend, disabled = false, docName = "company_handbook.pdf" }) {
	const [text, setText] = useState("");

	function submit(e) {
		e.preventDefault();
		const value = text.trim();
		if (!value || disabled) return;
		onSend(value);
		setText("");
	}

	return (
		<form
			onSubmit={submit}
			style={{
				margin: "0 24px 18px",
				border: "1px solid #1c2d66",
				borderRadius: 12,
				padding: 10,
				background: "linear-gradient(180deg, #0a1230, #091027)",
			}}
		>
			<div
				style={{
					display: "inline-flex",
					alignItems: "center",
					gap: 6,
					fontSize: 12,
					color: "#9db2e5",
					border: "1px solid #1f356f",
					borderRadius: 8,
					padding: "4px 8px",
					marginBottom: 8,
				}}
			>
				<span style={{ color: "#2dd390" }}>[DOC]</span>
				{docName}
			</div>
			<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
				<span style={{ color: "var(--muted)", fontSize: 18 }}>+</span>
				<input
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder="Explain how semantic search works in the retrieval step."
					disabled={disabled}
					style={{
						flex: 1,
						border: 0,
						outline: 0,
						background: "transparent",
						color: "var(--text)",
						fontSize: 16,
						padding: "8px 4px",
					}}
				/>
				<button
					type="submit"
					disabled={disabled || !text.trim()}
					style={{
						width: 54,
						height: 32,
						borderRadius: 8,
						border: 0,
						cursor: "pointer",
						color: "white",
						background: "linear-gradient(120deg, #6d56ff, #8e72ff)",
					}}
				>
					Send
				</button>
			</div>
		</form>
	);
}
