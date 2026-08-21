import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().trim().min(1, "Choose a label.").max(80),
  recipient_name: z.string().trim().min(1, "Enter recipient name.").max(150),
  phone: z.string().trim().min(10, "Enter a valid phone number.").max(16),
  address_line_1: z.string().trim().min(1, "Enter house / street details.").max(255),
  address_line_2: z.string().trim().max(255).optional(),
  landmark: z.string().trim().max(150).optional(),
  locality: z.string().trim().max(150).optional(),
  city: z.string().trim().min(1, "Enter city.").max(100),
  state: z.string().trim().min(1, "Enter state.").max(100),
  postal_code: z.string().trim().min(1, "Enter pincode.").max(20),
  country: z.string().trim().min(1).max(100),
  is_default: z.boolean(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

export const emptyAddressValues: AddressFormValues = {
  label: "Home",
  recipient_name: "",
  phone: "",
  address_line_1: "",
  address_line_2: "",
  landmark: "",
  locality: "",
  city: "Tirupattur",
  state: "Tamil Nadu",
  postal_code: "",
  country: "India",
  is_default: false,
};
