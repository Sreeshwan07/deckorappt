---
name: Access Control & Approval System
description: Super Admin approval workflow gating presentation generation and export
type: feature
---
Replaced the ₹20 pay-per-download model with a Super Admin approval workflow.

- `profiles` table tracks user `status`: `pending` | `approved` | `rejected` | `suspended`.
- `app_config` table holds `super_admin_email` (seeded `mdr.gemini@gmail.com`).
- New signups → trigger creates `profiles` row as `pending`. If email matches super admin, auto-approved and granted `admin` role.
- Only `approved` users (or admins) can INSERT/UPDATE `presentations` and `slides` — enforced by RLS using `is_approved(uid)` + `has_role(uid,'admin')`.
- Non-approved users are redirected to `/pending` by `ProtectedRoute`.
- `/admin` (admin-only) lists Pending / Approved / Rejected / Suspended users with Approve / Reject / Suspend / Reactivate actions.
- Export (PPTX/PDF/DOCX) is free for any approved user — no payment gate.
- No payment provider, no payments table, no `is_paid` column.
