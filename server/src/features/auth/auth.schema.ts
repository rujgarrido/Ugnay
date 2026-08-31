import { z } from "zod";

// Validation schema for user registration input
export const registerSchema = z
.object({
  firstName: z.string().min(2, "First name is required"),

  lastName: z.string().min(2, "Last name is required"),

  email: z.string().email("Invalid email"),

  password: z.string().min(8, "Password must be at least 8 characters"),

  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
})
.refine(
    // Custom validation to ensure passwords match
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8,"Password must be at least 8 characters" ),
})