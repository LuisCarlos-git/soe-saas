import { useSelector } from "@tanstack/react-form";
import { Button } from "@soe/ui";
import type { ButtonProps } from "@soe/ui";
import { useFormContext } from "../context";

export type SubmitButtonProps = Omit<ButtonProps, "type" | "loading">;

export function SubmitButton(props: SubmitButtonProps) {
  const form = useFormContext();
  const isSubmitting = useSelector(form.store, (state) => state.isSubmitting);
  return <Button {...props} type="submit" loading={isSubmitting} />;
}
