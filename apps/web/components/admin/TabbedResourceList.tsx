"use client";

import React from "react";
import { useListContext } from "ra-core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Count } from "@/components/admin";
import { cn } from "@/lib/utils";

export interface TabConfig {
  value: string;
  label: string;
  filter?: Record<string, any>;
  storeKey: string;
  badge?: boolean;
  hidden?: boolean;
}

interface TabbedResourceListProps {
  tabs: TabConfig[];
  defaultTab?: string;
  children: (tab: TabConfig) => React.ReactNode;
  className?: string;
  tabsListClassName?: string;
  tabsTriggerClassName?: string;
  storePersistent?: boolean;
}

export const TabbedResourceList = ({
  tabs,
  defaultTab,
  children,
  className,
  tabsListClassName,
  tabsTriggerClassName,
  storePersistent = true,
}: TabbedResourceListProps) => {
  const listContext = useListContext();
  const { filterValues, setFilters, displayedFilters } = listContext;

  // Determine current active tab based on filter values
  const getCurrentTab = (): string => {
    // Find matching tab based on filters
    for (const tab of tabs) {
      if (tab.filter) {
        const filterKeys = Object.keys(tab.filter);
        const matchesAll = filterKeys.every(key => {
          const expectedValue = tab.filter![key];
          const currentValue = filterValues[key];
          
          // Handle array filters (like relation_in)
          if (Array.isArray(expectedValue)) {
            return Array.isArray(currentValue) && 
                   currentValue.length === expectedValue.length &&
                   currentValue.every(v => expectedValue.includes(v));
          }
          
          return currentValue === expectedValue;
        });
        
        if (matchesAll) return tab.value;
      }
    }
    
    // Fallback to default tab or first tab
    return defaultTab || tabs[0]?.value || 'all';
  };

  const currentTab = getCurrentTab();

  const handleTabChange = (tabValue: string) => {
    const tab = tabs.find(t => t.value === tabValue);
    if (!tab) return;

    if (tab.filter) {
      // Apply the tab's specific filters
      setFilters({ ...filterValues, ...tab.filter }, displayedFilters);
    } else {
      // Remove tab-specific filters (for "all" tabs)
      const newFilters = { ...filterValues };
      
      // Remove filters that are used by other tabs
      tabs.forEach(otherTab => {
        if (otherTab.filter) {
          Object.keys(otherTab.filter).forEach(key => {
            delete newFilters[key];
          });
        }
      });
      
      setFilters(newFilters, displayedFilters);
    }
  };

  const visibleTabs = tabs.filter(tab => !tab.hidden);

  return (
    <Tabs value={currentTab} className={cn("mb-4", className)}>
      <TabsList className={cn("w-full", tabsListClassName)}>
        {visibleTabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={cn(tabsTriggerClassName)}
          >
            {tab.label}
            {tab.badge !== false && (
              <Badge variant="outline" className="ml-2 hidden md:inline-flex">
                <Count filter={{ ...filterValues, ...(tab.filter || {}) }} />
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {visibleTabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {children(tab)}
        </TabsContent>
      ))}
    </Tabs>
  );
};

// Predefined tab configurations for common patterns
export const statusTabs = {
  student: [
    { value: 'active', label: 'Active', filter: { status: 'active' }, storeKey: 'students.list.active' },
    { value: 'inactive', label: 'Inactive', filter: { status: 'inactive' }, storeKey: 'students.list.inactive' },
    { value: 'graduated', label: 'Graduated', filter: { status: 'graduated' }, storeKey: 'students.list.graduated' },
  ] as TabConfig[],
  
  staff: [
    { value: 'active', label: 'Active', filter: { status: 'active' }, storeKey: 'staff.list.active' },
    { value: 'inactive', label: 'Inactive', filter: { status: 'inactive' }, storeKey: 'staff.list.inactive' },
    { value: 'on_leave', label: 'On Leave', filter: { status: 'on_leave' }, storeKey: 'staff.list.on_leave' },
    { value: 'terminated', label: 'Terminated', filter: { status: 'terminated' }, storeKey: 'staff.list.terminated' },
  ] as TabConfig[],
  
  guardianRelation: [
    { value: 'father', label: 'Fathers', filter: { relation: 'father' }, storeKey: 'guardians.list.father' },
    { value: 'mother', label: 'Mothers', filter: { relation: 'mother' }, storeKey: 'guardians.list.mother' },
    { value: 'guardian', label: 'Guardians', filter: { relation: 'guardian' }, storeKey: 'guardians.list.guardian' },
    { 
      value: 'other', 
      label: 'Others', 
      filter: { relation_in: ['grandfather', 'grandmother', 'uncle', 'aunt', 'other'] }, 
      storeKey: 'guardians.list.other' 
    },
    { value: 'all', label: 'All Guardians', filter: {}, storeKey: 'guardians.list.all' },
  ] as TabConfig[],
  
  teacherExperience: [
    { 
      value: 'novice', 
      label: 'Novice (0-3 years)', 
      filter: { experienceYears_lte: 3 }, 
      storeKey: 'teachers.list.novice' 
    },
    { 
      value: 'experienced', 
      label: 'Experienced (4-10 years)', 
      filter: { experienceYears_gte: 4, experienceYears_lte: 10 }, 
      storeKey: 'teachers.list.experienced' 
    },
    { 
      value: 'senior', 
      label: 'Senior (11+ years)', 
      filter: { experienceYears_gte: 11 }, 
      storeKey: 'teachers.list.senior' 
    },
    { value: 'all', label: 'All Teachers', filter: {}, storeKey: 'teachers.list.all' },
  ] as TabConfig[],
  
  enrollment: [
    { value: 'active', label: 'Active', filter: { status: 'active' }, storeKey: 'enrollments.list.active' },
    { value: 'inactive', label: 'Inactive', filter: { status: 'inactive' }, storeKey: 'enrollments.list.inactive' },
    { value: 'transferred', label: 'Transferred', filter: { status: 'transferred' }, storeKey: 'enrollments.list.transferred' },
    { value: 'graduated', label: 'Graduated', filter: { status: 'graduated' }, storeKey: 'enrollments.list.graduated' },
    { value: 'dropped', label: 'Dropped', filter: { status: 'dropped' }, storeKey: 'enrollments.list.dropped' },
  ] as TabConfig[],
};

export default TabbedResourceList;