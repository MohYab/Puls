import { Card } from "../components/Card";
import { ErrorMessage, LoadingMessage } from "../components/Feedback";
import { PasswordForm } from "../features/account/PasswordForm";
import { ProfileForm } from "../features/account/ProfileForm";
import { useAccount } from "../features/account/useAccount";
import { usePageTitle } from "../hooks/usePageTitle";

export default function AccountPage() {
  usePageTitle("My account");
  const { data: account, isPending, isError, error, refetch } = useAccount();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">My account</h1>
      <p className="mt-1 text-sm text-gray-600">Your own details and password.</p>

      <div className="mt-6">
        {isPending && <LoadingMessage>Loading your account...</LoadingMessage>}
        {isError && <ErrorMessage message={error.message} onRetry={() => refetch()} />}

        {account && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title="Profile">
              <ProfileForm account={account} />
            </Card>
            <Card title="Password">
              <PasswordForm />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
