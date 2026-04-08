export default function Button({ children, variant = "primary", ...props }) {
	const styles = {
		primary: {
			background: "linear-gradient(120deg, var(--accent), var(--accent-2))",
			color: "white",
			border: "1px solid transparent",
		},
		ghost: {
			background: "transparent",
			color: "var(--text)",
			border: "1px solid var(--line)",
		},
	};

	return (
		<button
			{...props}
			style={{
				borderRadius: 10,
				padding: "10px 14px",
				fontWeight: 600,
				cursor: "pointer",
				transition: "transform 180ms ease, opacity 180ms ease",
				...styles[variant],
			}}
		>
			{children}
		</button>
	);
}
