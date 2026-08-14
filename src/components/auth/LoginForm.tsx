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
import { AppLogo } from '../brand/AppLogo';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ViewIcon,
  ViewOffIcon,
  LockedIcon,
  Mail01Icon,
  Loading03Icon,
  AlertCircleIcon,
} from '@hugeicons/core-free-icons';

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
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Clear server error message as soon as user modifies input
  useEffect(() => {
    const subscription = watch(() => {
      if (errorMsg) setErrorMsg(null);
    });
    return () => subscription.unsubscribe();
  }, [watch, errorMsg]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setErrorMsg(null);
      await signIn({
        email: data.email.trim(),
        password: data.password,
      });
      navigate(fromPath, { replace: true });
    } catch (err: any) {
      setErrorMsg(
        err.message || 'Unable to sign in. Please verify your admin credentials and try again.'
      );
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Mobile-Only Header Brand Emblem */}
      <div className="lg:hidden flex flex-col items-center text-center pb-2">
        <AppLogo size="md" lightText />
      </div>

      {/* Form Header */}
      <div className="space-y-1.5 text-center lg:text-left">
        <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-cream tracking-tight">
          Welcome back
        </h2>
        <p className="text-xs sm:text-sm text-[#EAD5C3]/75 font-normal">
          Sign in to manage orders, menu, printing, and cafe operations.
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1" noValidate>
        {/* Inline Server Error Alert */}
        {errorMsg && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-destructive/15 text-destructive-foreground border border-destructive/30 flex items-start gap-2.5 text-xs font-medium leading-relaxed animate-fade-in"
          >
            <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-destructive shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Email Address Input Field */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold text-[#EAD5C3] uppercase tracking-wider block">
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
              spellCheck={false}
              className="pl-10 text-xs bg-[#1D100A] border-[#3E2519] text-cream h-11 rounded-xl focus-visible:ring-[#E5A88B] focus-visible:border-[#E5A88B] transition-colors"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-destructive text-[11px] font-semibold pl-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Input Field with Interactive Visibility Toggle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-bold text-[#EAD5C3] uppercase tracking-wider block">
              Admin Password
            </Label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cream/40">
              <HugeiconsIcon icon={LockedIcon} size={16} />
            </div>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              autoComplete="current-password"
              className="pl-10 pr-11 text-xs bg-[#1D100A] border-[#3E2519] text-cream h-11 rounded-xl focus-visible:ring-[#E5A88B] focus-visible:border-[#E5A88B] transition-colors font-mono tracking-wider placeholder:font-sans placeholder:tracking-normal"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-cream/40 hover:text-cream transition-colors focus:outline-none cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <HugeiconsIcon icon={showPassword ? ViewOffIcon : ViewIcon} size={16} />
            </button>
          </div>
          {errors.password && (
            <p className="text-destructive text-[11px] font-semibold pl-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Action Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#B85C1E] to-[#D97026] hover:from-[#C86624] hover:to-[#E87E34] text-white font-bold h-12 text-xs sm:text-sm rounded-xl shadow-xl shadow-[#B85C1E]/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin text-white" />
                <span>Verifying credentials...</span>
              </span>
            ) : (
              <span>Sign In to Admin Portal</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
