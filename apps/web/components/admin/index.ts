export * from "./admin";
export * from "./app-sidebar";
export * from "./array-field";
export * from "./array-input";
export * from "./autocomplete-input";
export * from "./autocomplete-array-input";
export * from "./badge-field";
export * from "./boolean-input";
export * from "./breadcrumb";
export * from "./bulk-actions-toolbar";
export * from "./bulk-delete-button";
export * from "./count";
export * from "./create-button";
export * from "./create";
export * from "./data-table";
export * from "./date-input";
export * from "./date-range-input";
export * from "./delete-button";
export * from "./edit-button";
export * from "./edit-guesser";
export * from "./edit";
export * from "./export-button";
export * from "./filter-category";
export * from "./form";
export * from "./layout";
export * from "./list-button";
export * from "./list-guesser";
export * from "./list-pagination";
export * from "./list";
export * from "./locales-menu-button";
export * from "./login-page";
export * from "./notification";
export * from "./number-field";
export * from "./number-input";
export * from "./ready";
export * from "./record-field";
export * from "./reference-array-input";
export * from "./reference-array-field";
export * from "./reference-field";
export * from "./reference-input";
export * from "./reference-many-count";
export * from "./reference-many-field";
export * from "./refresh-button";
export * from "./search-input";
export * from "./select-input";
export * from "./show-button";
export * from "./show-guesser";
export * from "./show";
export * from "./simple-form";
export * from "./simple-form-iterator";
export * from "./simple-show-layout";
export * from "./single-field-list";
export * from "./text-field";
export * from "./text-input";
export * from "./toggle-filter-button";
export * from "./top-toolbar";
export * from "./theme-mode-toggle";
export * from "./theme-provider";
export * from "./user-menu";

// Shared Badge Components
export * from "./StatusBadge";
export * from "./GenderBadge";
export * from "./RelationBadge";
export * from "./TabbedResourceList";

// New Shared Components for DRY
export * from "./EmptyState";
export * from "./BaseForm";

// UI Components for DRY compliance
export { TableSkeleton, FormSkeleton, CardSkeleton, ListItemSkeleton, DetailsSkeleton, StatsSkeleton, ResourceListSkeleton } from "../ui/loading-skeleton";
export { ErrorBoundary, withErrorBoundary, ResourceErrorBoundary, ListErrorBoundary, FormErrorBoundary } from "../ui/error-boundary";
// export { BaseDialog, ConfirmDialog, DeleteDialog, FormDialog, InfoDialog, useDialog } from "../ui/base-dialog";
// export { TableActions, BulkActions } from "../ui/table-actions";
export { ResponsiveColumn, ResponsiveHeader, ResponsiveDiv, ResponsiveSpan } from "../ui/responsive-column";

// Re-export validators from React Admin
export { required, email, minLength, maxLength, minValue, maxValue } from "react-admin";

