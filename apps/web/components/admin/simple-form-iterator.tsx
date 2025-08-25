"use client";

import React from 'react';
import { useArrayInputContext } from '@/hooks/ArrayInputContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SimpleFormIteratorProps {
  children: React.ReactNode;
  addLabel?: string;
  removeLabel?: string;
  disableReordering?: boolean;
  disableAdd?: boolean;
  disableRemove?: boolean;
  className?: string;
}

export const SimpleFormIterator = ({
  children,
  addLabel = "Add",
  removeLabel = "Remove",
  disableAdd = false,
  disableRemove = false,
  className,
}: SimpleFormIteratorProps) => {
  const { fields, append, remove } = useArrayInputContext();

  const handleAdd = () => {
    append({});
  };

  const handleRemove = (index: number) => {
    remove(index);
  };

  const renderItem = (field: any, index: number) => (
    <Card key={field.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Item number indicator */}
          <div className="flex-shrink-0 mt-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">
                {index + 1}
              </span>
            </div>
          </div>
          
          <div className="flex-1">
            {React.Children.map(children, (child) =>
              React.isValidElement(child)
                ? React.cloneElement(child as React.ReactElement<any>, {
                    ...child.props,
                    // Pass the index to help with field naming
                    record: field,
                    source: child.props.source,
                  })
                : child
            )}
          </div>

          {!disableRemove && (
            <div className="flex-shrink-0 mt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                title={removeLabel}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {fields.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-muted-foreground/25 rounded-lg">
          <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No components added yet</p>
          <p className="text-xs">Click the button below to add your first fee component</p>
        </div>
      )}
      
      {fields.map((field, index) => renderItem(field, index))}
      
      {!disableAdd && (
        <Button
          type="button"
          variant="outline"
          onClick={handleAdd}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          {addLabel}
        </Button>
      )}
    </div>
  );
};

export default SimpleFormIterator;