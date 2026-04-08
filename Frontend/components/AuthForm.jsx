"use client";

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
	return (
		<div className="auth-card">
			<h1 className="auth-title">{title}</h1>
			<p className="auth-subtitle">{subtitle}</p>
			<form className="auth-form" onSubmit={onSubmit}>
				{fields.map((field) => (
					<Input
						key={field.name}
						type={field.type}
						value={values[field.name] || ""}
						placeholder={field.placeholder}
						onChange={(e) => onChange(field.name, e.target.value)}
						required
					/>
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
