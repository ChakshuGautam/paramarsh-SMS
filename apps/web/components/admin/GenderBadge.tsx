"use client";

import { useRecordContext } from "ra-core";
import { Badge } from "@/components/ui/badge";
import { getGenderColor, GenderType } from "@/lib/theme/colors";
import { cn } from "@/lib/utils";
import { User, UserIcon } from "lucide-react";

interface GenderBadgeProps {
  source?: string;
  record?: any;
  gender?: string;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const GenderBadge = ({ 
  source = "gender",
  record: propRecord,
  gender: propGender,
  className,
  showIcon = false,
  size = 'md'
}: GenderBadgeProps) => {
  const contextRecord = useRecordContext();
  const record = propRecord || contextRecord;
  const gender = propGender || record?.[source];

  if (!gender) return null;

  const colorConfig = getGenderColor(gender);
  const genderLabels: Record<string, string> = {
    male: 'Male',
    female: 'Female',
    other: 'Other',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <Badge 
      variant={colorConfig.badgeVariant}
      className={cn(
        colorConfig.background,
        colorConfig.text,
        sizeClasses[size],
        showIcon && 'flex items-center gap-1',
        className
      )}
    >
      {showIcon && <User className={iconSizes[size]} />}
      {genderLabels[gender] || gender}
    </Badge>
  );
};

// Wrapper component for use with react-admin fields
export const GenderField = (props: GenderBadgeProps) => {
  const record = useRecordContext();
  return <GenderBadge record={record} {...props} />;
};