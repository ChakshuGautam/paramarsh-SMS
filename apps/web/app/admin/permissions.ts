export const roleAllowedResources: Record<string, string[]> = {
  admin: ["*"],
  teacher: [
    "classes",
    "sections",
    "students",
    "attendanceRecords",
    "marks",
    "exams",
    "enrollments",
  ],
};

export function isResourceAllowed(roles: string[] | undefined, resource: string) {
  if (!roles || roles.length === 0) return false;
  if (roles.includes("admin")) return true;
  return roles.some((role) => roleAllowedResources[role]?.includes(resource));
}
