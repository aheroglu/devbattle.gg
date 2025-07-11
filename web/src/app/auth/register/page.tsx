import RegisterForm from "@/components/auth/register-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register - DevBattle.gg",
  description:
    "Create your DevBattle.gg account and start your coding journey.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
