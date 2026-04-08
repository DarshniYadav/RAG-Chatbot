"use client";

const KEYFRAMES = `@keyframes rag-pulse {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
  40% { transform: translateY(-3px); opacity: 1; }
}`;

export default function TypingDots() {
	return (
		<span style={{ display: "inline-flex", gap: 6 }} aria-label="Assistant is typing">
			<style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
			{[0, 1, 2].map((i) => (
				<span
					key={i}
					style={{
						width: 6,
						height: 6,
						borderRadius: "50%",
						background: "#9fb2e9",
						animation: `rag-pulse 1s ${i * 0.2}s infinite ease-in-out`,
					}}
				/>
			))}
		</span>
	);
}
