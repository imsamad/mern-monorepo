"use client";
import { type Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

type TextFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
};

const TextField = <T extends FieldValues>({
  control,
  name,
  label = "Label", // Default label text
  placeholder = "Enter value", // Default placeholder text
}: TextFieldProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const FormFieldWrapper = ({ children }: any) => children;

FormFieldWrapper.TextField = TextField;

export { FormFieldWrapper };
