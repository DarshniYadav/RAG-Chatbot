export default function Input(props) {
	return (
		<input
			{...props}
			style={{
				width: "100%",
				borderRadius: 10,
				border: "1px solid var(--line)",
				background: "var(--panel)",
				color: "var(--text)",
				padding: "11px 12px",
				outline: "none",
			}}
		/>
	);
}
