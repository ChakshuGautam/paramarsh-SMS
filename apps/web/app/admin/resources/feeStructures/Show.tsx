"use client";

import { Show, TextField } from "@/components/admin";
import { ReferenceField } from "@/components/admin/reference-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRecordContext } from "react-admin";
import { formatCurrency } from "@/lib/utils";
import { Receipt, GraduationCap, Hash, DollarSign } from "lucide-react";

const FeeStructureDetails = () => {
  const record = useRecordContext();

  if (!record) return null;

  const components = record.components || [];
  const totalAmount = components.reduce((sum: number, component: any) => {
    return sum + (Number(component.amount) || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Fee Structure Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Structure ID</p>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <TextField source="id" className="font-mono" />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Grade/Class</p>
              <ReferenceField reference="classes" source="gradeId">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-base">
                    <TextField source="name" />
                  </Badge>
                </div>
              </ReferenceField>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Structure Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Fee Structure Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Total Components</p>
              <div className="text-3xl font-bold text-primary">
                {components.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">fee components</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Total Annual Fee</p>
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(totalAmount)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">per academic year</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Components Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Fee Components Breakdown
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Detailed breakdown of all fee components for this grade/class
          </p>
        </CardHeader>
        <CardContent>
          {components.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Fee Components</p>
              <p className="text-sm">No fee components have been defined for this structure yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {components.map((component: any, index: number) => (
                <div key={index}>
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{component.name}</p>
                        {component.type && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {component.type.charAt(0).toUpperCase() + component.type.slice(1)} Fee
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(component.amount || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {((component.amount / totalAmount) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                  {index < components.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
              
              {/* Total Row */}
              <Separator className="my-4" />
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border-2 border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-bold text-xl">Total Annual Fee</p>
                    <p className="text-sm text-muted-foreground">Sum of all components</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {formatCurrency(totalAmount)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    per academic year
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const FeeStructuresShow = () => (
  <Show>
    <FeeStructureDetails />
  </Show>
);

export default FeeStructuresShow;





