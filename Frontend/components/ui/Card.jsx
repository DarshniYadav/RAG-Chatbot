export default function Card({ children, style }) {
	return (
		<section
			style={{
				background: "linear-gradient(165deg, #0b1335, #09102a)",
				border: "1px solid var(--line)",
				borderRadius: 14,
				boxShadow: "var(--shadow)",
				...style,
			}}
		>
			{children}
		</section>
	);
}
