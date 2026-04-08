"use client";

import MessageBubble from "./MessageBubble";

export default function ChatWindow({ messages, loading }) {
	return (
		<section
			style={{
				flex: 1,
				overflowY: "auto",
				padding: "26px 28px 14px",
				scrollbarColor: "#273f86 transparent",
			}}
		>
			{messages.length === 0 ? (
				<div style={{ marginTop: 24, maxWidth: 780, color: "var(--muted)" }}>
					<h2 style={{ margin: 0, fontSize: 30, color: "var(--text)", letterSpacing: "-0.02em" }}>
						Ask your knowledge base anything
					</h2>
					<p style={{ marginTop: 10, lineHeight: 1.7 }}>
						Use the composer below to chat with your uploaded documents using retrieval-augmented responses.
					</p>
				</div>
			) : null}

			<div style={{ maxWidth: 900 }}>
				{messages.map((msg) => (
					<MessageBubble key={msg.id} role={msg.role} content={msg.content} />
				))}
				{loading ? <MessageBubble role="assistant" content="" loading /> : null}
			</div>
		</section>
	);
}
