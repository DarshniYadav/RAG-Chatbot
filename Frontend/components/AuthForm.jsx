"use client";

import { useState } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";

export default function AuthForm({
	title,
	subtitle,
	fields,
	values,
	onChange,
	onSubmit,
	submitText,
	loadingText,
	loading,
	error,
	message,
}) {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className="auth-card">
			<h1 className="auth-title">{title}</h1>
			<p className="auth-subtitle">{subtitle}</p>
			<form className="auth-form" onSubmit={onSubmit} autoComplete="off">
				{fields.map((field) => (
					<div key={field.name} style={{ position: "relative" }}>
						<Input
							name={field.name}
							type={field.type === "password" && showPassword ? "text" : field.type}
							value={values[field.name] || ""}
							placeholder={field.placeholder}
							autoComplete={field.autoComplete || "off"}
							spellCheck={false}
							onChange={(e) => onChange(field.name, e.target.value)}
							required
							style={{
								width: "100%",
								borderRadius: 10,
								border: "1px solid var(--line)",
								background: "var(--panel)",
								color: "var(--text)",
								padding: field.type === "password" ? "11px 44px 11px 12px" : "11px 12px",
								outline: "none",
							}}
						/>
						{field.type === "password" ? (
							<button
								type="button"
								onClick={() => setShowPassword((current) => !current)}
								aria-label={showPassword ? "Hide password" : "Show password"}
								style={{
									position: "absolute",
									right: 8,
									top: "50%",
									transform: "translateY(-50%)",
									width: 28,
									height: 28,
									borderRadius: 8,
									border: "1px solid var(--line)",
									background: "var(--panel-2)",
									color: "var(--text)",
									cursor: "pointer",
									display: "grid",
									placeItems: "center",
									padding: 0,
								}}
							>
								{showPassword ? (
									<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
										<path d="M3 3l18 18" />
										<path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" />
										<path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c7 0 10 7 10 7a18.4 18.4 0 0 1-2.28 3.72" />
										<path d="M6.61 6.61A18.4 18.4 0 0 0 2 12s3 7 10 7c1.08 0 2.09-.15 3.03-.42" />
									</svg>
								) : (
									<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
										<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
										<circle cx="12" cy="12" r="3" />
									</svg>
								)}
							</button>
						) : null}
					</div>
				))}
				<Button type="submit" disabled={loading}>
					{loading ? loadingText : submitText}
				</Button>
			</form>
			{message ? <p className="auth-msg">{message}</p> : null}
			{error ? <p className="auth-err">{error}</p> : null}
		</div>
	);
}
