"use client";
import { SessionProvider } from "next-auth/react";

const NextAuthWrapper = ({ children }: any) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export { NextAuthWrapper };
