import "./global.css";
import { NextAuthWrapper } from "./NextAuthWrapper";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextAuthWrapper>{children}</NextAuthWrapper>
        <Toaster />
      </body>
    </html>
  );
}
