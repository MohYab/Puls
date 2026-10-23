import { LoginForm } from "../features/auth/LoginForm";
import { usePageTitle } from "../hooks/usePageTitle";

export default function LoginPage() {
  usePageTitle("Log in");
  return <LoginForm />;
}
