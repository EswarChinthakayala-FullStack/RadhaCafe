import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { SettingsSection } from './SettingsSection';
import { SettingsRow } from './SettingsRow';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import { toast } from '../../ui/toast';
import { ROUTES } from '../../../constants/routes';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Logout01Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';

export function AccountSecuritySettings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showSignOutDialog, setShowSignOutDialog] = useState<boolean>(false);
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  const handleConfirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      toast.add({
        title: 'Signed Out',
        description: 'You have been safely signed out of RadhaCafe.',
        type: 'info',
      });
      navigate(ROUTES.PUBLIC.LOGIN);
    } catch {
      toast.add({
        title: 'Sign Out Failed',
        description: 'Unable to clear session. Please refresh.',
        type: 'error',
      });
    } finally {
      setIsSigningOut(false);
      setShowSignOutDialog(false);
    }
  };

  const adminEmail = user?.email || 'Email unavailable';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-0.5 pb-2 border-b border-border/60">
        <h3 className="text-lg font-bold font-heading text-foreground">
          Account & Security
        </h3>
        <p className="text-xs text-muted-foreground">
          Review the signed-in administrator and manage this session.
        </p>
      </div>

      {/* Account Profile Card */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-secondary/20 space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cinnamon/10 text-cinnamon border border-cinnamon/20 flex items-center justify-center font-bold text-lg font-heading shrink-0 shadow-2xs">
            {adminEmail.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-foreground font-heading truncate">
                {adminEmail}
              </span>
              <Badge className="bg-cinnamon text-white font-bold text-[10px] px-2 py-0 h-4">
                Administrator
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              This is the single administrator account for RadhaCafe.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Session & Security Details */}
      <SettingsSection title="Authentication & Session">
        <SettingsRow
          title="Session Status"
          description="This administrator session is currently signed in."
        >
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
            <span>Signed in</span>
          </div>
        </SettingsRow>

        <SettingsRow
          title="Account Scope"
          description="RadhaCafe is configured for one cafe administrator."
        >
          <div className="text-xs text-muted-foreground font-mono bg-secondary/40 px-3 py-1.5 rounded-xl border border-border/60">
            Cafe administrator
          </div>
        </SettingsRow>
      </SettingsSection>

      {/* Section 2: Session Actions */}
      <SettingsSection title="Session Actions" showSeparator={false}>
        <SettingsRow
          title="Sign Out Session"
          description="Safely end your administrative session on this counter device."
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowSignOutDialog(true)}
            className="h-8.5 text-xs font-semibold rounded-xl text-destructive hover:bg-destructive/10 border-destructive/30 gap-1.5 shadow-2xs"
          >
            <HugeiconsIcon icon={Logout01Icon} size={14} />
            <span>Sign Out</span>
          </Button>
        </SettingsRow>
      </SettingsSection>

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent className="bg-card border-border/90 rounded-2xl shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading font-bold text-base text-foreground">
              Sign out of RadhaCafe?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              You will need your administrator email and password to access POS ordering, customer lists, and thermal printer controls again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="text-xs rounded-lg h-9">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSignOut}
              disabled={isSigningOut}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-bold rounded-lg h-9"
            >
              {isSigningOut ? 'Signing out...' : 'Yes, Sign Out'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
