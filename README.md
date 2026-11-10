# LIETTrack

**Lords Institute of Engineering & Technology Transportation Tracking System**  
*Your Campus. Your Bus. Your Time.*

LIETTrack is a proposed campus transportation platform for Lords Institute of Engineering & Technology (LIET), Hyderabad, Telangana, India. It is designed to help students and faculty find their assigned bus and pickup location, see routes and schedules, and check journey status and estimated arrivals. It also supports transport administrators and bus drivers in their respective workflows.

## Product direction

LIETTrack is an institutional transport tool, not a generic public-transit dashboard. The primary experience is a map-first workspace that answers: **Where is my bus, and when should I be at my stop?** It should remain useful when live data is unavailable by clearly distinguishing scheduled information from live updates.

### Visual foundation

- **Brand:** LIETTrack, presented as a simple wordmark. Institutional references should be respectful and understated; use official LIET marks only when authorized assets are available.
- **Colors:** forest green `#145C43` for primary actions and selections; dark green `#104A36` for interaction states; warm canvas `#F7F7F4`; white `#FFFFFF` surfaces; charcoal `#242A27` text; muted text `#58635D`; borders `#E1E5E0`. Use status colors sparingly and never as the only indication of status.
- **Typography:** Public Sans with system sans-serif fallbacks. Use 12px metadata, 14px supporting text, 16px body, 20px section headings and 28px page titles. Use tabular numerals for arrival times.
- **Spacing and surfaces:** 4px base scale, commonly 8, 12, 16, 24 and 32px. Prefer dividers and subtle borders over shadows. Use 6px control and 8px panel radii.
- **Controls:** green primary buttons, outlined secondary buttons and understated tertiary actions. Provide clear keyboard focus, disabled and loading states, and touch targets of at least 44 × 44px.
- **Map:** subdued roads and landmarks, legible stops, distinct route lines and directional bus markers. Always pair the map with accessible list and detail views. Motion should explain changes and respect reduced-motion preferences.

### Navigation and screens

- **Students and faculty:** My bus, Routes & stops, Schedule, Notifications and account settings. The home view prioritizes assigned bus, pickup stop, journey status and next arrival.
- **Drivers:** Today's trip, route and stops, and journey status controls appropriate to their assigned vehicle.
- **Transport administrators:** Buses, routes and stops, assignments, schedules, service notices and operational status.
- **Mobile:** a compact bottom navigation for the most-used passenger destinations, with a map and expandable details sheet. Desktop uses a navigation sidebar, information panel and large map.
- **Authentication:** LIETTrack sign-in with role-appropriate access; the authentication method and institutional identity integration are to be confirmed.
- **Loading and empty states:** use practical messages such as “Finding your assigned bus” and “No bus assigned yet. Contact the transport office.” Never imply that sample or stale data is live.
- **Branding:** page titles should use the pattern `Page name | LIETTrack`; the browser description, footer and any future landing page should identify the LIET campus transportation service and its intended audience.

## Planned architecture

The repository contains a React/Vite landing page, an interactive student dashboard, and demo tracking and route views. The dashboard is available at `/dashboard` and does not require sign-in while authentication is unavailable. Authentication, live data and the following service boundaries are not yet implemented:

1. **Application shell and design system:** responsive layouts, navigation and reusable accessible components shared across roles.
2. **Passenger experience:** assigned bus, pickup stop, routes, schedules, notifications and map-based journey information.
3. **Driver and administrator experiences:** role-specific trip operations and transport management, with authorization enforced on the server.
4. **Transit data services:** buses, stops, routes, assignments and schedules; adapters for location updates and arrival predictions. Show update timestamps and label live, scheduled and stale information accurately.
5. **Identity and notifications:** authenticated role-based access and notification delivery, subject to the institution's requirements and available integrations.

Actual bus assignments, routes, schedules, live tracking, arrival predictions and notifications require verified institutional data and integrations. Do not present illustrative data as operational or live. Protect precise vehicle locations and personal assignment data with appropriate access controls and retention policies.

## Implementation decisions still needed

- Confirm the application's technology stack and deployment environment.
- Confirm LIET-approved branding assets and authentication method.
- Identify the authoritative transport data and vehicle-location sources, update frequency, and notification channels.
- Agree on role permissions, privacy requirements and the initial release scope.

## Run locally

Run `npm ci`, copy `.env.example` to `.env.local`, and fill in the Supabase project URL and browser-safe publishable (or legacy anon) key. Run `npm run dev`; use `npm run lint`, `npm test`, and `npm run build` for checks. Builds require the two environment variables. Never put a Supabase secret or service-role key in Vite variables. The map uses OpenStreetMap data and CARTO tiles, which require network access. Public tracking and route views contain illustrative data only.

The tracking page at `/tracking` uses sample buses and routes from `src/data.js`. The `campus` coordinate there is an editable illustrative destination, not a verified LIET location. The map can follow a selected bus when its coordinates change, but no GPS feed or automatic simulated movement is connected.

The route explorer at `/routes` searches the same sample routes and buses as the dashboard and tracking view. Its route durations, stop times, statuses and straight-line distances are illustrative. Morning and evening filters are omitted because the sample data does not establish service periods.

The Nearby Bus Stops page at `/stops` derives demo stops and serving routes from the shared transit data. Location is requested only when the user selects **Use My Location**; users can also choose a point on the map. Distances and the optional directions preview are straight-line estimates, not walking routes. Neither stop availability nor demo ETAs are live or verified.

The **My Bus** and **Student Profile** demo pages are available under `/dashboard?view=bus` and `/dashboard?view=profile`. Saved routes, optional profile fields and preferred-stop choices persist in browser local storage only; they are not authenticated, synced or authoritative. The sample bus assignment remains separate and cannot be changed by editing the profile. Notification delivery and sign-out are unavailable until authentication and notification services are integrated.

The driver portal is available at `/driver/login` and `/driver/dashboard`. Authentication is not connected; the dashboard is an unauthenticated demo. Starting a demo journey requests browser geolocation on user action and displays coordinates only in the current page. Nothing is transmitted or shown on the student tracking map. GPS may pause in the background and stops when the page is closed; the active demo trip is not restored after reload. Ending a demo journey stores its start/end time and route locally in the browser, without coordinates. Drivers should only operate the interface while safely parked.

## Transportation administration

The protected admin portal is at `/admin`, connected to the LIETTrack Supabase project. The SQL migrations in `supabase/migrations/` create an administrator allowlist, admin-only RLS policies and transport tables. No administrator is created automatically. A trusted Supabase operator must create a confirmed Auth user and grant its user ID membership in `public.admin_members` via a privileged SQL session; ordinary authenticated users cannot grant themselves access. Never expose a service-role key to the browser.

The admin portal supports protected bus, driver, route, stop, student, assignment, schedule and notice records, a route-stop builder, fleet map, trip filters and record-based summaries. The current student and driver demos do not read or write these tables. Bulk student import and historical telemetry reports are not connected; the sample student and driver demos remain separate from authenticated accounts. Bus/driver assignment status is not authentication. The map displays straight segments between configured stops; refresh data to fetch new positions. The browser uses the project's publishable key, while RLS enforces access. `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are required configuration; there are no hardcoded defaults.

### LIETTrack authentication and account provisioning

The shared `/login` uses Supabase email/password authentication and sends approved users to `/student/dashboard`, `/driver/dashboard`, or `/admin/dashboard`. `/admin` remains available for existing administrators. Admin membership is controlled exclusively by `admin_members`; no public sign-up can grant administrator permissions. Students and drivers require an administrator-managed `profiles` row linked to an existing Supabase Auth user and a transport record. In Admin → Settings, enter the Auth user's UUID, name, role and linked student/driver record to approve access or remove an existing profile. Create or invite the Auth user through a trusted Supabase operator first; the app does not create Auth accounts. Disabling a driver record blocks that driver's portal context. Students see only their assigned bus, route and pickup stop; drivers see their own bus and route. The server-side `my_transport_context()` function exposes only that limited context and existing admin-only RLS policies remain in force. No passwords are stored in application tables.

The old `/dashboard` and `/demo/driver` are explicitly separate, sample-data demos; the demo views are not connected to real trips or locations; notifications are not connected. Email sign-in is supported; student-ID sign-in is not yet implemented. Password recovery uses `/reset-password`; add each deployed origin's exact reset URL to Supabase Authentication redirect allowlist before use. Supabase currently has no custom SMTP configured, so default email delivery restrictions apply. The production domain, initial Vercel preview and `http://localhost:5173/reset-password` are allowlisted; other preview domains require configuration. Never add broad untrusted redirect URLs. Verify recovery and all three roles with actual accounts before rollout.

### GPS tracking

The approved driver portal starts an actual trip through the server and then requests browser GPS permission. It validates fixes and sends the latest location through an ownership-checked RPC; ending a trip stops the watcher and closes the trip. GPS updates are throttled and inaccurate or invalid readings are rejected. An active trip remains open after a reload or browser closure: the driver must return, resume sharing or end the trip. Permission denial or a network failure does not automatically close a trip. The admin fleet and assigned student's portal receive authorized GPS changes via Supabase Realtime. Data is marked LIVE within 45 seconds, STALE through three minutes, OFFLINE afterward, and simulated records DEMO. Offline coordinates are last known positions. The ETA is a rough estimate to the next stop using straight lines between configured stop coordinates and GPS speed or an assumed speed; it is not road-routing or traffic-aware, and is suppressed when geometry or a recent fix is missing.

A browser may suspend GPS when minimized or closed. Reliable continuous background tracking requires a native Android app with appropriate background location permissions and an operational privacy policy. Drivers should operate trip controls only while safely parked. No physical buses have been verified; do not treat the demo maps as live. The migration is applied to the connected Supabase project, but a deployed frontend must include these changes. Before real use, provision approved driver/student accounts, assign exactly one available bus and active route, configure route stops with coordinates, and test on actual phones. GPS values originate from the driver device and are not tamper-proof.

### Notifications and alerts

Approved students, drivers and administrators have a private in-app inbox at `/notifications`, with a bell and unread count in their authenticated portals. Notifications are generated by database events for trip start/completion, bus or student assignments, schedule and route changes, and new administrator announcements. Announcements are distributed when created; editing or deleting the source notice does not retract delivered inbox entries. The route-builder RPC emits a route-stop update when saved. GPS proximity messages are once per trip and stop, based on a live-source fix with accuracy at most 50 m and a 500 m straight-line radius; these are approximate proximity alerts, not proof of arrival or direction of travel. Simulated GPS never generates them. Event receipts prevent a deleted proximity alert from being regenerated.

Admin stale/offline alerts are checked while an authenticated admin has LIETTrack open, every 30 seconds. They are not background monitoring and will not be generated while no admin is online. Missed scheduled trips, traffic delays and true arrival detection are not automatically reported: the current data model has no service calendar, delay source, or reliable arrival semantics. Admins can communicate verified information using announcements. Existing sample notifications remain confined to the clearly labeled demo dashboard.

In-app alerts use RLS and Supabase Realtime, with periodic refresh as a fallback. New notifications are sent only to users provisioned at the time of the event. No browser notification permission is requested and no push messages are delivered yet. `public/notification-worker.js` is an unregistered scaffold only: a production push implementation still needs explicit opt-in, authenticated subscription registration/removal, a server-side delivery worker with VAPID keys held in server secrets, retries/expiry and subscription cleanup. Never put private keys in the client.

### Schedule management and ETA

Administrators manage schedules in **Admin → Schedules**. Schedules are bus- and route-specific, in India Standard Time, and require operating weekdays, validity dates and an explicit active setting. Optional stop times must follow the route order and be no earlier than departure; overnight trips are not supported. Old route-only schedules are preserved but remain inactive until completed. The database rejects a bus/route mismatch and duplicate active departures for the same bus, overlapping weekdays and validity dates. This is not a full overlap check: the current model does not define trip end times. Deactivate active schedules before changing a bus's route. After changing route stops, review and resave affected schedules; stop-order changes are not automatically reconciled.

Approved students can open `/student/schedule` for today, tomorrow and the next seven days. A live estimate requires a recent real-source fix on the active trip and complete stop coordinates. The engine projects onto straight stop-to-stop segments, applies bounded GPS speed or a historical trip-average/assumed fallback, and suppresses ETAs when stopped, stale, simulated, too far off-route or over four hours away. These are low-confidence estimates and are not road or traffic-aware. An estimated early/on-time/delayed comparison appears only if exactly one active schedule matches the trip start within 30 minutes and the pickup has a scheduled time. It is not an actual arrival measurement, is not persisted, and does not currently generate a deviation alert. Schedule changes do generate in-app notifications. The app has no official LIET timetable until authorized administrators enter one. Browser and real-device validation is still required.

## Production readiness

Vercel uses `npm run build`, `dist`, and an SPA rewrite in `vercel.json`. Set the two public environment variables in Vercel before building. Supabase migrations in `supabase/migrations` must be applied to the intended project, with RLS and RPC access verified. Provision real routes, buses, schedules, accounts and assignments through trusted operators; sample pages are not production records. Configure production SMTP and validate email confirmation and password recovery before rollout. Verify Vercel deployment protection and public access, each role and protected route, GPS on real devices, maps, notifications and schedules, and mobile/desktop browsers. Notifications currently depend on an open admin session for fleet checks; push delivery and persisted schedule deviation alerts are not implemented. Background location depends on browser and device support.
