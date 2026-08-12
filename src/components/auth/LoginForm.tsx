import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginSchema, type LoginFormData } from '../../lib/validators/loginSchema';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader } from '../ui/card';
import { AppLogo } from '../brand/AppLogo';
import { HugeiconsIcon } from '@hugeicons/react';
import { ViewIcon, ViewOffIcon, LockedIcon, Mail01Icon, LockKeyIcon } from '@hugeicons/core-free-icons';

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isAuthenticated, initialized } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const fromPath = (location.state as any)?.from?.pathname || ROUTES.ADMIN.DASHBOARD;

  useEffect(() => {
    if (initialized && isAuthenticated) {
      navigate(fromPath, { replace: true });
    }
  }, [isAuthenticated, initialized, navigate, fromPath]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setErrorMsg(null);
      await signIn(data);
      navigate(fromPath, { replace: true });
    } catch (err: any) {
      setErrorMsg(
        err.message || 'Unable to sign in. Please check your admin credentials and try again.'
      );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border border-[#2C1810] bg-[#1D100A] text-cream rounded-md shadow-2xl overflow-hidden p-2 sm:p-4">
      {/* Mobile Branding Header (visible on mobile only) */}
      <CardHeader className="text-center flex flex-col items-center pb-2 pt-4">
        <div className="lg:hidden mb-3">
          <AppLogo size="md" lightText />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5A88B]/10 border border-[#E5A88B]/20 text-[#E5A88B] text-[11px] font-bold uppercase tracking-wider mb-2">
          <HugeiconsIcon icon={LockKeyIcon} size={12} />
          <span>ADMIN AUTHENTICATION</span>
        </div>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-cream">
          Welcome Back
        </h2>
        <p className="text-xs text-cream/70 mt-1 font-normal">
          Sign in to access your cafe management portal.
        </p>
      </CardHeader>

      <CardContent className="pt-2 pb-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          {/* Error Alert Message */}
          {errorMsg && (
            <div className="p-3 text-xs rounded-md bg-destructive/15 text-destructive-foreground border border-destructive/30 font-medium leading-relaxed">
              {errorMsg}
            </div>
          )}

          {/* Email Address Input */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-cream/90">
              Admin Email Address
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cream/40">
                <HugeiconsIcon icon={Mail01Icon} size={16} />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="admin@radhacafe.com"
                autoComplete="username"
                className="pl-10 text-xs bg-[#140A06] border-[#2C1810] text-cream h-10 rounded-md focus-visible:ring-[#E5A88B]"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-destructive text-[11px] font-semibold">{errors.email.message}</p>
            )}
          </div>

          {/* Password Input with Visibility Toggle */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-cream/90">
              Admin Password
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cream/40">
                <HugeiconsIcon icon={LockedIcon} size={16} />
              </div>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pl-10 pr-10 text-xs bg-[#140A06] border-[#2C1810] text-cream h-10 rounded-md focus-visible:ring-[#E5A88B]"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-cream/40 hover:text-cream transition-colors focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <HugeiconsIcon icon={showPassword ? ViewOffIcon : ViewIcon} size={16} />
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-[11px] font-semibold">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Action Button */}
          <Button
            type="submit"
            className="w-full bg-[#E5A88B] hover:bg-[#EEB89D] text-[#140A06] font-bold h-11 text-xs rounded-md shadow-md transition-all hover:scale-[1.01] active:scale-95 mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In to Admin Portal'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
