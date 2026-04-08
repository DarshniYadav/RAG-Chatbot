"use client";

import Link from "next/link";
import { useRef } from "react";

export default function Sidebar({
	sessions,
	activeId,
	onSelect,
	onNewChat,
	onUploadFile,
	uploading = false,
	uploadMessage = "",
	isAuthenticated = false,
	userEmail = "",
	onLogout,
}) {
	const fileInputRef = useRef(null);

	function handleUploadClick() {
		if (!isAuthenticated || uploading) return;
		fileInputRef.current?.click();
	}

	function handleFileChange(event) {
		const file = event.target.files?.[0];
		if (!file) return;
		onUploadFile?.(file);
		// Clear value so selecting the same file again still triggers change.
		event.target.value = "";
	}

	return (
		<aside
			style={{
				width: 250,
				background: "linear-gradient(180deg, var(--sidebar), #040a1d)",
				borderRight: "1px solid #15275f",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<div style={{ padding: 12, borderBottom: "1px solid #13255a" }}>
				<button
					suppressHydrationWarning
					type="button"
					onClick={onNewChat}
					style={{
						width: "100%",
						border: 0,
						borderRadius: 10,
						background: "linear-gradient(120deg, #6d56ff, #8c6fff)",
						color: "#fff",
						textAlign: "left",
						fontWeight: 700,
						padding: "10px 12px",
						cursor: "pointer",
					}}
				>
					+ New Chat
				</button>
			</div>

			<div style={{ padding: 12, overflowY: "auto", flex: 1 }}>
				<p style={{ margin: "10px 0", fontSize: 12, color: "#8ea2d7" }}>Today</p>
				{sessions.map((session) => (
					<button
						suppressHydrationWarning
						key={session.id}
						onClick={() => onSelect(session.id)}
						type="button"
						style={{
							width: "100%",
							textAlign: "left",
							border: "1px solid transparent",
							background: activeId === session.id ? "#11204d" : "transparent",
							color: activeId === session.id ? "#f4f6ff" : "#a9b9e3",
							borderRadius: 8,
							padding: "8px 10px",
							marginBottom: 6,
							cursor: "pointer",
						}}
					>
						{session.title}
					</button>
				))}
			</div>

			<div style={{ padding: 12, borderTop: "1px solid #14255b" }}>
				<input
					suppressHydrationWarning
					type="file"
					accept=".pdf,.txt,.md,.docx"
					ref={fileInputRef}
					onChange={handleFileChange}
					style={{ display: "none" }}
				/>
				<button
					suppressHydrationWarning
					type="button"
					onClick={handleUploadClick}
					disabled={!isAuthenticated || uploading}
					style={{
						width: "100%",
						background: "transparent",
						border: "1px solid #233f84",
						borderRadius: 10,
						color: "#c4d1f4",
						padding: "9px 10px",
						textAlign: "left",
						cursor: !isAuthenticated || uploading ? "not-allowed" : "pointer",
						opacity: !isAuthenticated || uploading ? 0.65 : 1,
					}}
				>
					{uploading ? "Uploading..." : "Upload Documents"}
				</button>
				{uploadMessage ? (
					<p style={{ margin: "8px 2px 0", fontSize: 12, color: "#a6bbea" }}>{uploadMessage}</p>
				) : null}
				{isAuthenticated ? (
					<div style={{ marginTop: 12 }}>
						<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
							<div
								style={{
									width: 30,
									height: 30,
									borderRadius: "50%",
									background: "linear-gradient(130deg, #66b2ff, #73e4b3)",
								}}
							/>
							<div>
								<p style={{ margin: 0, fontSize: 13 }}>Signed in</p>
								<p style={{ margin: 0, fontSize: 11, color: "#8ea2d7" }}>{userEmail || "Authenticated user"}</p>
							</div>
						</div>
						<button
							type="button"
							onClick={onLogout}
							style={{
								marginTop: 10,
								width: "100%",
								background: "transparent",
								border: "1px solid #365cad",
								borderRadius: 10,
								color: "#d7e4ff",
								padding: "9px 10px",
								textAlign: "center",
								cursor: "pointer",
							}}
						>
							Logout
						</button>
					</div>
				) : (
					<div style={{ marginTop: 12, display: "grid", gap: 8 }}>
						<Link href="/login" className="chat-auth-btn-primary" style={{ textAlign: "center" }}>
							Login
						</Link>
						<Link href="/register" className="chat-auth-btn-secondary" style={{ textAlign: "center" }}>
							Register
						</Link>
					</div>
				)}
			</div>
		</aside>
	);
}
