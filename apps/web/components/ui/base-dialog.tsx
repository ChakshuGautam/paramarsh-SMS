"use client";

import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

/**
 * BaseDialog - Unified dialog component
 * 
 * Replaces 8+ different dialog implementations with a single configurable component.
 * Supports various dialog types: info, confirm, delete, form, custom
 */

type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
type DialogVariant = 'default' | 'destructive' | 'warning' | 'success' | 'info';

interface BaseDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: DialogSize;
  variant?: DialogVariant;
  className?: string;
  showCloseButton?: boolean;
  preventClose?: boolean;
  loading?: boolean;
  onClose?: () => void;
}

const sizeClasses: Record<DialogSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  full: 'sm:max-w-[90vw]',
};

const variantIcons: Record<DialogVariant, React.ElementType> = {
  default: Info,
  destructive: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
};

const variantColors: Record<DialogVariant, string> = {
  default: 'text-foreground',
  destructive: 'text-destructive',
  warning: 'text-yellow-600',
  success: 'text-green-600',
  info: 'text-blue-600',
};

export const BaseDialog: React.FC<BaseDialogProps> = ({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  size = 'md',
  variant = 'default',
  className,
  showCloseButton = true,
  preventClose = false,
  loading = false,
  onClose,
}) => {
  const handleOpenChange = (newOpen: boolean) => {
    if (preventClose && !newOpen) return;
    onOpenChange?.(newOpen);
    if (!newOpen) onClose?.();
  };

  const Icon = variantIcons[variant];
  const iconColor = variantColors[variant];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent 
        className={cn(sizeClasses[size], className)}
        onInteractOutside={(e) => {
          if (preventClose) e.preventDefault();
        }}
      >
        {showCloseButton && !preventClose && (
          <button
            onClick={() => handleOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
        
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {variant !== 'default' && (
              <Icon className={cn("h-5 w-5", iconColor)} />
            )}
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          children && <div className="py-4">{children}</div>
        )}
        
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};

/**
 * ConfirmDialog - Specialized confirmation dialog
 */
interface ConfirmDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  loading = false,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange?.(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={loading || isLoading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading || isLoading}
            className={variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {(loading || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

/**
 * DeleteDialog - Specialized delete confirmation dialog
 */
interface DeleteDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  resource: string;
  itemName?: string;
  onDelete: () => void | Promise<void>;
  loading?: boolean;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  onOpenChange,
  trigger,
  resource,
  itemName,
  onDelete,
  loading = false,
}) => {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title={`Delete ${resource}`}
      description={
        itemName
          ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
          : `Are you sure you want to delete this ${resource.toLowerCase()}? This action cannot be undone.`
      }
      confirmLabel="Delete"
      cancelLabel="Cancel"
      onConfirm={onDelete}
      variant="destructive"
      loading={loading}
    />
  );
};

/**
 * FormDialog - Dialog wrapper for forms
 */
interface FormDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit: () => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  size?: DialogSize;
  loading?: boolean;
  preventClose?: boolean;
}

export const FormDialog: React.FC<FormDialogProps> = ({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  size = 'md',
  loading = false,
  preventClose = false,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit();
      onOpenChange?.(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title={title}
      description={description}
      size={size}
      preventClose={preventClose || isSubmitting}
      loading={loading}
      footer={
        <>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || loading}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </>
      }
    >
      {children}
    </BaseDialog>
  );
};

/**
 * InfoDialog - Simple information dialog
 */
interface InfoDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  content: ReactNode;
  closeLabel?: string;
}

export const InfoDialog: React.FC<InfoDialogProps> = ({
  open,
  onOpenChange,
  trigger,
  title,
  content,
  closeLabel = 'Close',
}) => {
  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title={title}
      variant="info"
      footer={
        <Button onClick={() => onOpenChange?.(false)}>
          {closeLabel}
        </Button>
      }
    >
      {content}
    </BaseDialog>
  );
};

/**
 * useDialog - Hook for managing dialog state
 */
export const useDialog = (initialOpen = false) => {
  const [isOpen, setIsOpen] = React.useState(initialOpen);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
};

// Export all dialog components
export default {
  Base: BaseDialog,
  Confirm: ConfirmDialog,
  Delete: DeleteDialog,
  Form: FormDialog,
  Info: InfoDialog,
};