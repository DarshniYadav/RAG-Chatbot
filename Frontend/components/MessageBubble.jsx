import MarkdownRenderer from "./MarkdownRenderer";
import TypingDots from "./TypingDots";

export default function MessageBubble({ role, content, loading = false }) {
	const isUser = role === "user";

	return (
		<div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
			<div
				style={{
					width: 28,
					height: 28,
					borderRadius: "50%",
					background: isUser
						? "linear-gradient(130deg, #6a53ff, #8f74ff)"
						: "linear-gradient(130deg, #1d2c58, #243b77)",
					display: "grid",
					placeItems: "center",
					fontSize: 12,
					fontWeight: 700,
				}}
			>
				{isUser ? "U" : "AI"}
			</div>
			<div
				style={{
					flex: 1,
					background: isUser ? "transparent" : "rgba(13, 22, 56, 0.72)",
					border: isUser ? "0" : "1px solid #1a2a62",
					borderRadius: 12,
					padding: isUser ? 0 : "14px 16px",
				}}
			>
				{loading ? <TypingDots /> : <MarkdownRenderer content={content} />}
			</div>
		</div>
	);
}
