import { useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@soe/ui";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@soe/ui/primitives/dialog";

export function MfaDialog({
  open,
  onOpenChange,
  title,
  description,
  trigger,
  onCloseFocus,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  trigger?: ReactNode;
  onCloseFocus?: () => void;
  children: ReactNode;
}) {
  const content = useRef<HTMLDivElement>(null);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        ref={content}
        showCloseButton={false}
        className="max-h-[calc(100svh-2rem)] overflow-y-auto rounded-xl border-rule bg-surface text-ink sm:max-w-lg"
        onOpenAutoFocus={(event) => {
          const input = content.current?.querySelector("input");
          if (input) {
            event.preventDefault();
            input.focus();
          }
        }}
        onCloseAutoFocus={(event) => {
          if (onCloseFocus) {
            event.preventDefault();
            onCloseFocus();
          }
        }}
      >
        <DialogHeader className="pr-12 text-left">
          <DialogTitle className="text-2xl leading-tight">{title}</DialogTitle>
          <DialogDescription className="leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogClose asChild>
          <Button
            variant="ghost"
            className="absolute right-3 top-3 size-11 p-0"
            aria-label="Fechar"
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        </DialogClose>
        {open && children}
      </DialogContent>
    </Dialog>
  );
}
