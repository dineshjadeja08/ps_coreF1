import { z } from "zod";

export const profileSchema = z.object({
  display_name: z.string().trim().max(255, "Display name is too long."),
  first_name: z.string().trim().max(150, "First name is too long."),
  last_name: z.string().trim().max(150, "Last name is too long."),
  email: z.string().trim().email("Enter a valid email.").or(z.literal("")),
  alternate_phone: z.string().trim().max(16, "Phone number is too long."),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
