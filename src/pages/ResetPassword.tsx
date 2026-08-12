import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const checkRecoverySession = async () => {
      const { data } = await supabase.auth.getSession();
      if (active && data.session) setIsReady(true);
    };

    void checkRecoverySession();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && event === 'PASSWORD_RECOVERY' && session) setIsReady(true);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 6) {
      toast.error('Choose a password with at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('The passwords do not match.');
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsSaving(false);

    if (error) {
      toast.error('Unable to update password', { description: error.message });
      return;
    }

    toast.success('Password updated. You can now sign in.');
    await supabase.auth.signOut();
    navigate('/auth', { replace: true });
  };

  return (
    <main className="min-h-screen bg-background px-5 py-16 text-foreground">
      <section className="mx-auto w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-xl">
        <h1 className="font-serif text-center text-4xl tracking-wide">SENTEUR</h1>
        <h2 className="mt-10 font-serif text-2xl">Choose a new password</h2>
        <p className="mt-3 text-muted-foreground">
          {isReady
            ? 'Set a new password for your admin account.'
            : 'Open the password-reset link from your email to continue.'}
        </p>

        {isReady ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block text-sm text-muted-foreground">
              New password
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded border border-border bg-background px-4 py-3 text-foreground"
                required
              />
            </label>
            <label className="block text-sm text-muted-foreground">
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-2 w-full rounded border border-border bg-background px-4 py-3 text-foreground"
                required
              />
            </label>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded bg-primary px-4 py-3 font-medium text-primary-foreground disabled:opacity-60"
            >
              {isSaving ? 'Saving password…' : 'Save new password'}
            </button>
          </form>
        ) : (
          <Link to="/auth" className="mt-8 inline-block text-primary underline underline-offset-4">
            Back to sign in
          </Link>
        )}
      </section>
    </main>
  );
};

export default ResetPassword;
