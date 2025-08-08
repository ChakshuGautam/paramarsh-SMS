# Super Admin & Tenant Management — Detailed Spec

## Overview
Multi-tenant administration for groups of schools.

## Features
- Tenant provisioning, custom domains, branding, roles
- Global settings, feature flags per tenant
- Cross-tenant analytics (aggregate, anonymized where needed)

## APIs
- POST /api/v1/tenants
- PATCH /api/v1/tenants/{id}

## Acceptance Criteria
- Isolation controls validated; no data leakage across tenants

## Tickets
- TEN-1: Provisioning & Branding (SP: 8)
- TEN-2: Flags & Settings (SP: 5)
