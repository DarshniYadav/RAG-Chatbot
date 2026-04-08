"use client";

export default function ModelSelector({ model, onChange }) {
	return (
		<header
			style={{
				height: 52,
				borderBottom: "1px solid #152860",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				padding: "0 18px",
				background: "rgba(8, 16, 42, 0.7)",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
				<span style={{ color: "#dbe4ff", fontSize: 14, fontWeight: 600 }}>{model}</span>
				<select
					value={model}
					onChange={(e) => onChange(e.target.value)}
					style={{
						background: "transparent",
						border: 0,
						color: "var(--muted)",
						outline: 0,
						cursor: "pointer",
					}}
				>
					<option style={{ color: "#111" }} value="Enterprise RAG Model">
						Enterprise RAG Model
					</option>
					<option style={{ color: "#111" }} value="Fast RAG Model">
						Fast RAG Model
					</option>
				</select>
			</div>
			<button
				type="button"
				style={{ background: "transparent", border: 0, color: "#8ea2d7", cursor: "pointer" }}
			>
				Share
			</button>
		</header>
	);
}
