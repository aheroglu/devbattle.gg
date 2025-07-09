import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - DevBattle.gg",
  description:
    "Sign in to your DevBattle.gg account and join the coding battles.",
};

export default function LoginPage() {
  return <LoginForm />;
}
