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

Install dependencies with `npm install`, then run `npm run dev`. Build with `npm run build`. The map uses OpenStreetMap data and CARTO tiles, which require network access. The tracking and routes views contain illustrative data only; the login form does not submit credentials.

The tracking page at `/tracking` uses sample buses and routes from `src/data.js`. The `campus` coordinate there is an editable illustrative destination, not a verified LIET location. The map can follow a selected bus when its coordinates change, but no GPS feed or automatic simulated movement is connected.

The route explorer at `/routes` searches the same sample routes and buses as the dashboard and tracking view. Its route durations, stop times, statuses and straight-line distances are illustrative. Morning and evening filters are omitted because the sample data does not establish service periods.

The Nearby Bus Stops page at `/stops` derives demo stops and serving routes from the shared transit data. Location is requested only when the user selects **Use My Location**; users can also choose a point on the map. Distances and the optional directions preview are straight-line estimates, not walking routes. Neither stop availability nor demo ETAs are live or verified.

The **My Bus** and **Student Profile** demo pages are available under `/dashboard?view=bus` and `/dashboard?view=profile`. Saved routes, optional profile fields and preferred-stop choices persist in browser local storage only; they are not authenticated, synced or authoritative. The sample bus assignment remains separate and cannot be changed by editing the profile. Notification delivery and sign-out are unavailable until authentication and notification services are integrated.

The driver portal is available at `/driver/login` and `/driver/dashboard`. Authentication is not connected; the dashboard is an unauthenticated demo. Starting a demo journey requests browser geolocation on user action and displays coordinates only in the current page. Nothing is transmitted or shown on the student tracking map. GPS may pause in the background and stops when the page is closed; the active demo trip is not restored after reload. Ending a demo journey stores its start/end time and route locally in the browser, without coordinates. Drivers should only operate the interface while safely parked.

## Transportation administration

The protected admin portal is at `/admin`, connected to the LIETTrack Supabase project. The SQL migrations in `supabase/migrations/` create an administrator allowlist, admin-only RLS policies and transport tables. No administrator is created automatically. A trusted Supabase operator must create a confirmed Auth user and grant its user ID membership in `public.admin_members` via a privileged SQL session; ordinary authenticated users cannot grant themselves access. Never expose a service-role key to the browser.

The admin portal supports protected bus, driver, route, stop, student, assignment, schedule and notice records, a route-stop builder, fleet map, trip filters and record-based summaries. The current student and driver demos do not read or write these tables. GPS ingestion, notification delivery, bulk student import, actual driver-account disabling and historical telemetry reports are not connected. Bus/driver assignment status is not authentication. The map displays straight segments between configured stops; refresh data to fetch new positions. The browser uses the project's publishable key, while RLS enforces access. `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` may override the default project configuration.
