import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string({
      required_error: "email is required",
      invalid_type_error: "invalid data type",
    })
    .email(),
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "invalid data type",
    })
    .min(1, { message: "Password is required" }),
});

export type TLoginSchema = z.infer<typeof LoginSchema>;

export const SignUpSchema = LoginSchema.pick({ email: true }).merge(
  z.object({
    fullName: z
      .string({
        required_error: "Fullname is required",
        invalid_type_error: "invalid data type",
      })
      .min(5),
    password: z
      .string({
        required_error: "email is required",
        invalid_type_error: "invalid data type",
      })
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
          message:
            "Password must include an uppercase letter, a lowercase letter, a digit, and a special character",
        },
      ),
  }),
);
export type TSignupSchema = z.infer<typeof SignUpSchema>;

export const OTPSchema = z.object({
  otp: z.string({
    required_error: "otp is required",
    invalid_type_error: "invalid data type",
  }),
});

export type TOtpSchema = z.infer<typeof OTPSchema>;

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const ObjectIdSchema = z
  .string()
  .refine((value) => objectIdRegex.test(value), {
    message: "Invalid ObjectID format",
  });
