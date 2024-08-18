"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  LoginSchema,
  OTPSchema,
  SignUpSchema,
  TLoginSchema,
  TOtpSchema,
  TSignupSchema,
} from "@repo/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormFieldWrapper } from "./FormFieldWrapper";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./ui/input-otp";
import { fetcher } from "@/lib/fetcher";
import { signIn } from "next-auth/react";
import { useToast } from "./ui/use-toast";
import { flushSync } from "react-dom";

const AuthForm = () => {
  const { toast } = useToast();
  const pathname = usePathname();
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo") || "/profile";
  const router = useRouter();

  const [step, setStep] = useState<"signup" | "login" | "otp">(
    pathname.includes("signup")
      ? "signup"
      : pathname.includes("login")
        ? "login"
        : "otp"
  );

  const loginForm = useForm<TLoginSchema>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "hello@gmail.com",
      password: "Password@123",
    },
  });

  const signupForm = useForm<TSignupSchema>({
    resolver: zodResolver(SignUpSchema),
    values: {
      email: "hello@gmail.com",
      password: "Password@123",
      fullName: "Abdus Samad",
    },
  });

  const otpForm = useForm<TOtpSchema>({
    resolver: zodResolver(OTPSchema),
    values: {
      otp: "",
    },
  });

  const handleLoginSubmit = async (userData: TLoginSchema) => {
    await new Promise((resolve) => setTimeout(resolve, 6000));
    try {
      await fetcher("/auth/login", "POST", userData);

      const res = await signIn("credentials", {
        email: userData.email,
        password: userData.password,
        redirect: false,
      });

      if (!res?.ok) {
        await fetcher("/auth/logout", "DELETE");
        // show alert to user
      }
      router.push(redirectTo);
    } catch (error: any) {
      await fetcher("/auth/logout", "DELETE");
      if (error?.message?.email)
        loginForm.setError("email", error.message.email);
      if (error?.message?.password)
        loginForm.setError("password", error.message.password);
    }
  };

  const handleSignupSubmit = async (userData: TLoginSchema) => {
    try {
      const data = await fetcher("/auth/signup", "POST", userData);

      startTimer();

      window.localStorage.setItem("newlyRegisteredUser", data.userId);

      setStep("otp");

      // in dev env only OTP will be sent back in json, to speed up process.
      if (data.otp) otpForm.setValue("otp", data.otp);
    } catch (error: any) {
      if (error.message.email)
        signupForm.setError("email", { message: "Email is taken!" });
      else {
        toast({
          title: "Retry again",
          variant: "destructive",
        });
      }
    }
  };

  const [count, setCounter] = useState(0);
  const timerRef = useRef<any>();
  const startTimer = () => {
    const min = parseInt(
      process.env.NEXT_PUBLIC_OTP_RETRY_IN_MIN! as string,
      10
    );

    flushSync(() => {
      setCounter(min * 60);
    });

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCounter((prevCounter) => {
        if (prevCounter <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prevCounter - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  const hadleOtpSubmit = async ({ otp }: TOtpSchema) => {
    // console.log(":", d);
    try {
      await fetcher(`/auth/confirmOTP/${otp}`, "POST");
      window.localStorage.removeItem("newlyRegisteredUser");
      await handleLoginSubmit({
        email: signupForm.getValues().email,
        password: signupForm.getValues().password,
      });
    } catch (error) {
      otpForm.setError("otp", { message: "Invalid OTP" });
    }
  };
  const [isResending, setIsResending] = useState(false);
  const handleResentOTP = async () => {
    try {
      setIsResending(true);
      const userId = window.localStorage.getItem("newlyRegisteredUser");
      await fetcher(`/auth/resendOTP/${userId}`, "POST");
      startTimer();
    } catch (error) {
    } finally {
      setIsResending(false);
    }
  };
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">
          {step == "signup"
            ? "Sign Up"
            : step != "otp"
              ? "Log In"
              : "Enter OTP"}
        </CardTitle>
        <CardDescription>
          {step == "signup"
            ? "Enter your information to create an account"
            : step != "otp"
              ? "Enter your email below to login to your account"
              : "Enter OTP sent at your address"}
        </CardDescription>
      </CardHeader>

      <CardContent key={step}>
        {step != "otp" ? (
          <AuthFormWrapper
            step={step}
            form={step == "signup" ? signupForm : loginForm}
            handleSubmit={
              step == "signup"
                ? signupForm.handleSubmit(handleSignupSubmit)
                : loginForm.handleSubmit(handleLoginSubmit)
            }
          />
        ) : (
          <Form {...otpForm}>
            <form
              onSubmit={otpForm.handleSubmit(hadleOtpSubmit)}
              className="flex flex-col gap-4"
            >
              <InputOTP
                maxLength={6}
                onChange={(e) => {
                  console.log("e:", e);
                  otpForm.setValue("otp", e);
                }}
                value={otpForm.getValues().otp}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <p className="inputErrorMsg">
                {otpForm.formState.errors.otp?.message ?? ""}
              </p>
              <Button
                disabled={isResending || otpForm.formState.isSubmitting}
                type="submit"
                className="w-full"
                size="sm"
              >
                Submit
              </Button>
              <Button
                type="submit"
                className="w-full"
                size="sm"
                onClick={() => handleResentOTP()}
                disabled={
                  count > 0 || otpForm.formState.isSubmitting || isResending
                }
              >
                {`Resend ${count ? `(${count})` : ""}`}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthForm;

const AuthFormWrapper = ({ form, handleSubmit, step }: any) => {
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          {step == "signup" ? (
            <div className="flex flex-col gap-2">
              <FormFieldWrapper.TextField
                control={form.control}
                name="fullName"
              />
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <FormFieldWrapper.TextField control={form.control} name="email" />
          </div>
          <div className="flex flex-col gap-2">
            <FormFieldWrapper.TextField
              control={form.control}
              name="password"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {step == "signup" ? "Create an account" : "Login"}
          </Button>
        </div>
        {step == "signup" ? (
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        ) : (
          <div className="mt-4 text-center text-sm">
            Don't have an account?
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        )}
      </form>
    </Form>
  );
};
