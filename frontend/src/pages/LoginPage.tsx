import { LoginForm } from "../features/auth/LoginForm";
import { usePageTitle } from "../hooks/usePageTitle";

export default function LoginPage() {
  usePageTitle("Log in");
  return (
    <>
      <h1 className="mb-5 font-display text-xl font-bold text-ink">Log in</h1>
      <LoginForm />
    </>
  );
}
