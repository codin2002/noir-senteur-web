# Preorder System — Implementation Plan

A complete preorder flow layered on the existing Supabase + React stack (Ziina payments, inventory_logs already in place). Built in phases so it ships incrementally.

## Phase 1 — Database

Extend existing tables (no destructive changes).

**`perfumes`** — add columns:
- `product_type` text default `'in_stock'` (`in_stock` | `preorder` | `out_of_stock`)
- `preorder_enabled` boolean default false
- `preorder_start_date`, `preorder_end_date`, `expected_shipping_date` timestamptz
- `preorder_limit` int (nullable), `preorder_count` int default 0

**`inventory`** — add:
- `reserved_stock` int default 0
- `incoming_stock` int default 0

**`orders`** — add:
- `is_preorder` boolean default false
- `payment_status` text default `'pending'` (pending|paid|partial|failed)
- Extend `status` to allow `preorder`, `awaiting_release`, `ready_to_ship`

**`order_items`** — add:
- `is_preorder` boolean default false

**New table `preorder_fulfillments`** — FIFO queue:
- `preorder_id` (FK preorders), `order_item_id`, `fulfilled_quantity`, `fulfilled_at`, `notes`

Reuse existing `preorders` table created earlier as the customer-intent record; link to `order_items` via `order_id`/`order_item_id`.

RLS: keep public insert for guest preorders; authenticated read/update/delete for admins.

## Phase 2 — Backend Logic (Edge Functions + RPCs)

1. **`create_preorder_order` RPC** — atomically:
   - Validates window (`now()` between start/end) and `preorder_count < preorder_limit`
   - Creates order with `is_preorder=true`, `status='preorder'`
   - Increments `inventory.reserved_stock` and `perfumes.preorder_count`

2. **Update `verify-payment` edge function**:
   - If order `is_preorder` → set `payment_status='paid'`, status stays `preorder` (don't deduct `available_stock`)
   - Mixed carts: per-item `is_preorder` flag drives behavior

3. **`fulfill_preorders` RPC** — when stock arrives:
   - Move `incoming_stock` → `available_stock`
   - FIFO loop over preorder order_items: deduct stock, mark item fulfilled, decrement `reserved_stock` & `preorder_count`, flip order status to `ready_to_ship` when all items fulfilled

4. **`cancel_preorder` RPC** — decrement reserved_stock + preorder_count, set order `cancelled`

5. **Partial payment**: optional deposit field on order; shipping blocked while `payment_status='partial'` (UI + status guard)

## Phase 3 — Frontend

**Product page (`PerfumeDetail`)**:
- "Preorder Available" badge + expected ship date
- Replace CTA with "Preorder Now" when applicable
- Countdown to `preorder_end_date` (bonus)
- Disabled state when limit reached / window expired

**Cart**:
- Per-item "Preorder" tag + estimated delivery line
- Mixed cart notice with split/hold choice (default: split shipment)

**Order status UI** (`OrderStatusBadge`, profile, admin):
- New labels: Preorder Confirmed, Awaiting Release, Ready to Ship

**Admin** (`/admin/actions` + product controls):
- Per-product preorder toggle, dates, limit, expected ship
- "Receive incoming stock" action → triggers `fulfill_preorders`
- Analytics tile on `/admin/analytics`: preorder revenue, pending fulfillment count, conversion rate (preorder views → orders if tracked, otherwise orders/limit)

## Phase 4 — Notifications

Extend existing Resend templates:
- `send-order-confirmation`: preorder variant ("Your preorder is confirmed, expected [date]")
- New `send-preorder-update` edge function for delay + shipping notifications, triggered from admin or fulfill RPC

## Phase 5 — Edge Cases & Guards

- Window/limit validation server-side (RPC raises exception → toast on client)
- Mixed cart: tag each `order_item.is_preorder` independently; `is_preorder` on order = true if any item preorder
- Prevent stock deduction for preorder items in `verify-payment`
- Idempotent fulfillment (check `fulfilled_at` before re-processing)

## Out of Scope (flagged for later)
- Supplier API integration
- Early-bird tiered pricing engine (single price for now; can extend)
- Priority shipping logic

## Suggested rollout order
1. Phase 1 migration (one approval)
2. Phase 2 RPCs + verify-payment update
3. Phase 3 product page + cart
4. Phase 3 admin controls + analytics tile
5. Phase 4 emails
6. Phase 5 polish

Reply with **"go"** to start with Phase 1, or tell me which phases to skip / reorder.
