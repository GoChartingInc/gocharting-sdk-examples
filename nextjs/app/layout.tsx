import type { ReactNode } from "react";

export const metadata = {
	title: "GoCharting SDK · Next.js",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body style={{ margin: 0, background: "#0d0f14" }}>{children}</body>
		</html>
	);
}
