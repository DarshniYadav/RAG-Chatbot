import "./globals.css";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";

const displayFont = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-display",
});

const monoFont = IBM_Plex_Mono({
	subsets: ["latin"],
	weight: ["400", "500"],
	variable: "--font-mono",
});

export const metadata = {
	title: "RAG Chatbot",
	description: "Frontend for the RAG Chatbot project",
	icons: {
		icon: "/favicon.svg",
	},
};

export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body suppressHydrationWarning className={`${displayFont.variable} ${monoFont.variable}`}>
				{children}
			</body>
		</html>
	);
}
