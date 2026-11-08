import { Card } from "../components/Card";
import { ErrorMessage, LoadingMessage } from "../components/Feedback";
import { PageHeader } from "../components/PageHeader";
import { isDemoMode } from "../config/demo";
import { PasswordForm } from "../features/account/PasswordForm";
import { ProfileForm } from "../features/account/ProfileForm";
import { useAccount } from "../features/account/useAccount";
import { usePageTitle } from "../hooks/usePageTitle";

export default function AccountPage() {
  usePageTitle("My account");
  const { data: account, isPending, isError, error, refetch } = useAccount();

  return (
    <div>
      <PageHeader title="My account" description="Your own details and password." />

      {isPending && <LoadingMessage>Loading your account...</LoadingMessage>}
      {isError && <ErrorMessage message={error.message} onRetry={() => refetch()} />}

      {account && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          <Card title="Profile">
            <ProfileForm account={account} />
          </Card>
          <Card title="Password">
            {isDemoMode() ? (
              <p className="text-sm text-muted">
                Password changes are turned off in the public demo.
              </p>
            ) : (
              <PasswordForm />
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
