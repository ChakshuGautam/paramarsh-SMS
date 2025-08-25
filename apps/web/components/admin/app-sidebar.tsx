import React, { createElement, useMemo, useState } from "react";
import {
  useCreatePath,
  useGetResourceLabel,
  useHasDashboard,
  useResourceDefinitions,
  useTranslate,
} from "ra-core";
import { Link, useMatch } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  List, 
  House, 
  Shell,
  Users,
  GraduationCap,
  Calendar,
  ClipboardCheck,
  BookOpen,
  CreditCard,
  MessageSquare,
  Settings,
  ChevronRight,
  UserCheck,
  School,
  Building2,
  UsersRound,
  FileText,
  DollarSign,
  Receipt,
  Wallet,
  CalendarDays,
  Clock,
  FileSpreadsheet,
  Award,
  Mail,
  Megaphone,
  TicketCheck,
  Cog,
  Database,
} from "lucide-react";
import { useGetIdentity } from "ra-core";
import { isResourceAllowed } from "@/app/admin/permissions";
import { cn } from "@/lib/utils";

// Define resource groups with their icons and resources
const resourceGroups = {
  'Students': {
    icon: GraduationCap,
    resources: ['students', 'guardians', 'classes', 'sections', 'enrollments'],
    resourceIcons: {
      students: Users,
      guardians: UsersRound,
      classes: School,
      sections: Building2,
      enrollments: FileText,
    }
  },
  'Attendance': {
    icon: ClipboardCheck,
    resources: ['attendanceSessions', 'substitutions', 'teacherAttendance'],
    resourceIcons: {
      attendanceSessions: Clock,
      substitutions: Users,
      teacherAttendance: UserCheck,
    }
  },
  'Academic': {
    icon: BookOpen,
    resources: ['subjects', 'teachers', 'academicYears'],
    resourceIcons: {
      subjects: BookOpen,
      teachers: UserCheck,
      academicYears: Calendar,
    }
  },
  'Assessment': {
    icon: FileSpreadsheet,
    resources: ['exams', 'marks'],
    resourceIcons: {
      exams: FileSpreadsheet,
      marks: Award,
    }
  },
  'Records': {
    icon: Database,
    resources: ['attendanceRecords', 'applications'],
    resourceIcons: {
      attendanceRecords: UserCheck,
      applications: FileSpreadsheet,
    }
  },
  'Timetable': {
    icon: Calendar,
    resources: ['timetables', 'timetablePeriods', 'sectionTimetables', 'timeSlots', 'rooms'],
    resourceIcons: {
      timetables: CalendarDays,
      timetablePeriods: Calendar,
      sectionTimetables: CalendarDays,
      timeSlots: Clock,
      rooms: Building2,
    }
  },
  'Finance': {
    icon: CreditCard,
    resources: ['feeStructures', 'feeSchedules', 'invoices', 'payments'],
    resourceIcons: {
      feeStructures: DollarSign,
      feeSchedules: Receipt,
      invoices: FileText,
      payments: Wallet,
    }
  },
  'Communication': {
    icon: MessageSquare,
    resources: ['messages', 'campaigns', 'templates', 'tickets'],
    resourceIcons: {
      messages: Mail,
      campaigns: Megaphone,
      templates: FileText,
      tickets: TicketCheck,
    }
  },
  'Administration': {
    icon: Settings,
    resources: ['staff', 'tenants', 'preferences'],
    resourceIcons: {
      staff: Users,
      tenants: Database,
      preferences: Cog,
    }
  },
};

export function AppSidebar() {
  const hasDashboard = useHasDashboard();
  const resources = useResourceDefinitions();
  const { data: identity } = useGetIdentity();
  const roles = (identity as any)?.roles as string[] | undefined;
  const { openMobile, setOpenMobile } = useSidebar();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Students': true,
    'Attendance': true,
  });

  const handleClick = () => {
    if (openMobile) {
      setOpenMobile(false);
    }
  };

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const visibleResourceNames = useMemo(() => {
    const names = Object.keys(resources).filter((name) => resources[name].hasList);
    if (roles === undefined) return [];
    if (Array.isArray(roles) && roles.includes("admin")) return names;
    return names.filter((name) => isResourceAllowed(roles, name));
  }, [resources, roles]);

  // Filter resources to only show those that exist, have list view, and are allowed
  const getGroupResources = (resourceList: string[]) => {
    return resourceList.filter(name => 
      visibleResourceNames.includes(name) && resources[name]?.hasList
    );
  };
  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/">
                <Shell className="!size-5" />
                <span className="text-base font-semibold">Paramarsh SMS</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Dashboard */}
        {hasDashboard && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <DashboardMenuItem onClick={handleClick} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Resource Groups */}
        {Object.entries(resourceGroups).map(([groupName, groupConfig]) => {
          const groupResources = getGroupResources(groupConfig.resources);
          
          // Don't show empty groups
          if (groupResources.length === 0) return null;

          const GroupIcon = groupConfig.icon;
          const isOpen = openGroups[groupName];

          return (
            <SidebarGroup key={groupName}>
              <SidebarGroupLabel 
                onClick={() => toggleGroup(groupName)}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-2 w-full py-1">
                  <GroupIcon className="h-4 w-4" />
                  <span className="flex-1 text-left text-sm font-medium">{groupName}</span>
                  <ChevronRight 
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isOpen && "rotate-90"
                    )}
                  />
                </div>
              </SidebarGroupLabel>
              {isOpen && (
                <SidebarGroupContent>
                  <SidebarMenu>
                    {groupResources.map((resourceName) => (
                      <ResourceMenuItem
                        key={resourceName}
                        name={resourceName}
                        onClick={handleClick}
                        icon={groupConfig.resourceIcons[resourceName as keyof typeof groupConfig.resourceIcons]}
                      />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          );
        })}

        {/* Ungrouped Resources (fallback for any resources not in groups) */}
        {(() => {
          const groupedResourceNames = Object.values(resourceGroups)
            .flatMap(group => group.resources);
          const ungroupedResources = visibleResourceNames
            .filter(name => !groupedResourceNames.includes(name));

          if (ungroupedResources.length === 0) return null;

          return (
            <SidebarGroup>
              <SidebarGroupLabel>Other</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {ungroupedResources.map((name) => (
                    <ResourceMenuItem
                      key={name}
                      name={name}
                      onClick={handleClick}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })()}
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}

export const DashboardMenuItem = ({ onClick }: { onClick?: () => void }) => {
  const translate = useTranslate();
  const label = translate("ra.page.dashboard", {
    _: "Dashboard",
  });
  const match = useMatch({ path: "/", end: true });
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={!!match}>
        <Link to="/" onClick={onClick}>
          <House />
          {label}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export const ResourceMenuItem = ({
  name,
  onClick,
  icon,
}: {
  name: string;
  onClick?: () => void;
  icon?: any;
}) => {
  const resources = useResourceDefinitions();
  const getResourceLabel = useGetResourceLabel();
  const createPath = useCreatePath();
  const to = createPath({
    resource: name,
    type: "list",
  });
  const match = useMatch({ path: to, end: false });
  
  // Move the Icon determination before any conditional returns
  const Icon = icon || (resources?.[name]?.icon ? resources[name].icon : List);
  
  // Conditional return after all hooks
  if (!resources || !resources[name]) return null;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={!!match} className="pl-8">
        <Link
          to={to}
          state={{ _scrollToTop: true }}
          onClick={onClick}
          aria-label={name}
          data-testid={`menu-${name}`}
        >
          {createElement(Icon, { className: "h-4 w-4" })}
          {getResourceLabel(name, 2)}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
