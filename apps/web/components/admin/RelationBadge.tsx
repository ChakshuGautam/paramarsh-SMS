"use client";

import { useRecordContext } from "ra-core";
import { Badge } from "@/components/ui/badge";
import { getRelationColor, RelationType } from "@/lib/theme/colors";
import { cn } from "@/lib/utils";
import { Users, Heart, User } from "lucide-react";

interface RelationBadgeProps {
  source?: string;
  record?: any;
  relation?: string;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RelationBadge = ({ 
  source = "relation",
  record: propRecord,
  relation: propRelation,
  className,
  showIcon = false,
  size = 'md'
}: RelationBadgeProps) => {
  const contextRecord = useRecordContext();
  const record = propRecord || contextRecord;
  const relation = propRelation || record?.[source];

  if (!relation) return null;

  const colorConfig = getRelationColor(relation);
  const relationLabels: Record<string, string> = {
    father: 'Father',
    mother: 'Mother',
    guardian: 'Guardian',
    grandfather: 'Grandfather',
    grandmother: 'Grandmother',
    uncle: 'Uncle',
    aunt: 'Aunt',
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

  // Choose icon based on relation
  const getRelationIcon = (relation: string) => {
    switch (relation) {
      case 'father':
      case 'mother':
        return <Heart className={iconSizes[size]} />;
      case 'guardian':
        return <Users className={iconSizes[size]} />;
      default:
        return <User className={iconSizes[size]} />;
    }
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
      {showIcon && getRelationIcon(relation)}
      {relationLabels[relation] || relation}
    </Badge>
  );
};

// Wrapper component for use with react-admin fields
export const RelationField = (props: RelationBadgeProps) => {
  const record = useRecordContext();
  return <RelationBadge record={record} {...props} />;
};