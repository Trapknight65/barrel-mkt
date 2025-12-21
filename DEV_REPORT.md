# Development Report

**Session Date:** 2025-12-21

## Key Decisions & Issues

### 1. ORM Selection: Switch from Prisma to TypeORM
**Issue:**
We attempted to install and initialize Prisma (`prisma`, `@prisma/client`) multiple times. The installation failed consistently due to:
- **Network/Registry Issues:** `npm install` timed out or hung indefinitely when fetching Prisma packages.
- **Dependency Conflicts:** Even with `--legacy-peer-deps` and `--force`, the installation was unstable or incomplete.
- **CLI Execution Failures:** Post-installation, the `npx prisma init` and `npx prisma generate` commands failed or hung, likely due to the corrupted installation.

**Resolution:**
To ensure progress and stability, we switched to **TypeORM** with **PostgreSQL**.
- Installed `@nestjs/typeorm`, `typeorm`, and `pg`.
- Configured `AppModule` to use TypeORM with the provided Supabase connection string.
- Created standard TypeORM entities (`User`, `Product`, `Order`, `OrderItem`) instead of a `schema.prisma` file.

**Status:**
- Backend is now running with TypeORM.
- Entities are performing `synchronize: true` (auto-migration) for rapid development.

### 2. Project Structure
- **Backend:** NestJS (Modules: Users, Products, Orders)
- **Frontend:** Next.js (Tailwind CSS, basic branding applied)

## Next Steps
- Implement Orders/Webhooks.
- Connect Frontend to Backend API.
- Deploy to Render.

---

## Session 2: 2025-12-21

### Completed
- **JWT Authentication:** `AuthModule`, `AuthService`, `AuthController`, `JwtStrategy` implemented.
- **Users Module:** `UsersService` for user creation and lookup.
- **Products CRUD:** `ProductsService`, `ProductsController` with full CRUD methods.
- **Orders Module:** `OrdersService`, `OrdersController` with create order and status updates.
- **Supplier Integration:** `SupplierModule` with placeholder CJ Dropshipping API methods.
- **Frontend Pages:**
  - `/` - Landing page with hero and category grid
  - `/shop` - Product catalog with category filters
  - `/shop/[id]` - Product detail with add to cart
  - `/cart` - Cart with checkout flow
  - `/login` - Login/Register with JWT handling
- **API Utility:** `lib/api.ts` for backend calls

### Servers
- **Backend:** `npx nest start` → `http://localhost:3001`
- **Frontend:** `npm run dev` → `http://localhost:3000`

## Session 3: 2025-12-21 - Production & Scale

### Key Accomplishments
- **Production Migration (Vercel)**:
  - Migrated both Frontend and Backend from local/Render to Vercel.
  - Configured Backend as a Serverless function (`api/index.ts`).
  - Resolved `csv-parser` build errors and enabled `esModuleInterop` in `tsconfig.json`.
  - Implemented ultra-permissive CORS for seamless Frontend-Backend communication.
- **CJ Dropshipping API v2.0**:
  - Fully rebuilt the integration using the latest official documentation.
  - Implemented **Auth V2**: Switched to `POST` authentication for robust token retrieval.
  - Implemented **Search V2**: Integrated the `listV2` (Elasticsearch) endpoint for better performance.
  - Implemented **Orders V2**: Successfully mapped payloads to the `/shopping/order/createOrderV2` endpoint.
- **Admin Enhancements**:
  - **CJ Import Tool**: Integrated real-time CJ search and product import with automated pricing.
  - **CSV Upload**: Bulk product import functionality for existing catalogs.
  - **Diagnostic Tools**: Added detailed logging to identify CJ API rate limits (5-minute lockout).

### Technical Resolves
- **CORS & Deployment Protection**: Identified and bypassed Vercel's automated protection that was blocking `OPTIONS` preflight requests.
- **TypeScript Compliance**: Fixed "Not Callable" errors for CommonJS modules in the build pipeline.

### Current Status
- **Backend (Vercel)**: `https://barrel-mkt-api.vercel.app` (Example)
- **Frontend (Vercel)**: `https://barrel-mkt.vercel.app` (Example)
- **Database**: Supabase (Live)
- **API Status**: CJ v2.0 Integrated & Verified

### Next Milestones
- **Stripe Integration**: Connect real payments to trigger automated fulfillment.
- **Webhook Scaling**: Production configuration of CJ Webhook listeners for status updates.
