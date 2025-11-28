# AltMonitor - Complete Project Overview

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Application Structure](#application-structure)
4. [Frontend Pages & Components](#frontend-pages--components)
5. [Backend API Structure](#backend-api-structure)
6. [Database Schema](#database-schema)
7. [Key Features](#key-features)
8. [File Organization](#file-organization)

---

## 🎯 Project Overview

**AltMonitor** is a comprehensive Investment Banking Platform for private equity monitoring, covenant parsing, and portfolio analytics. It provides end-to-end management of investment portfolios, including transaction tracking, facility management, covenant compliance monitoring, and cashflow scheduling.

### Primary Use Cases
- **Portfolio Management**: Track investments across multiple deals and facilities
- **Covenant Compliance**: Automatically parse and monitor financial covenants from PDF/Excel documents
- **Transaction Tracking**: Comprehensive transaction and deal management
- **Cashflow Analysis**: Generate and analyze cashflow schedules
- **Reporting Requirements**: Manage compliance and reporting schedules

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: Radix UI, ShadCN-style components
- **Routing**: React Router DOM v6
- **State Management**: React Context API
- **Charts**: Chart.js, React Chart.js 2, Recharts
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **Date Handling**: Luxon
- **PDF Generation**: jsPDF

### Backend
- **Framework**: Flask (Python)
- **ORM**: SQLAlchemy
- **Database**: SQLite (development) / PostgreSQL (production)
- **PDF Processing**: pdfplumber, PyPDF2
- **OCR**: pytesseract, pdf2image
- **Excel Processing**: openpyxl, pandas
- **Server**: Waitress (production)

### Data & Auth
- **Authentication**: Custom auth system with role-based permissions
- **Storage**: Supabase (PostgreSQL)
- **Encryption**: crypto-js

---

## 📁 Application Structure

```
Altmonitor/
├── frontend/ (React + TypeScript)
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── context/             # React Context providers
│   │   ├── lib/                 # Utilities and APIs
│   │   ├── pages/               # Page components
│   │   ├── types/               # TypeScript types
│   │   └── config/              # Configuration files
│   ├── public/                  # Static assets
│   └── dist/                    # Production build
│
├── backend/ (Flask)
│   ├── app.py                   # Main Flask application
│   ├── models.py                # SQLAlchemy models
│   ├── db.py                    # Database configuration
│   ├── parse_covenant.py        # Covenant parsing logic
│   ├── requirements.txt         # Python dependencies
│   └── uploads/                 # Uploaded files
│
├── docs/                        # Documentation
└── root config files            # package.json, vite.config, etc.
```

---

## 🎨 Frontend Pages & Components

### Main Application Routes (`/src/App.tsx`)

#### 1. **Main Dashboard** (`/main`)
**File**: `src/components/MainPage.tsx`
- **Description**: Central hub with navigation cards to all modules
- **Features**:
  - User profile display
  - Module cards (Transactions, Portfolio Tracking, etc.)
  - Admin access for super admins
  - Welcome message with user role
- **Icon**: Dashboard with 9 navigation modules

---

#### 2. **Transactions Page** (`/transactions`)
**File**: `src/components/TransactionsPage.tsx`
- **Description**: Comprehensive transaction management
- **Features**:
  - View all transactions in table format
  - Add/Edit/Delete transactions
  - Filter by deal name, issuer, country
  - Search functionality
  - Multi-field transaction form
  - Links to deal and facility detail pages
- **Key Data**: Deal name, Issuer, Currency, Country of Risk, Dates, Sponsors, Deal Types

---

#### 3. **Portfolio Tracking** (`/portfolio-tracking`)
**File**: `src/components/PortfolioTrackingPage.tsx`
- **Description**: Bloomberg-style portfolio summaries
- **Features**:
  - Portfolio statistics dashboard
  - Transaction and facility overview
  - Donut charts for portfolio breakdown
  - Filter and search functionality
  - Outstanding vs Commitment tracking
  - Sidebar navigation
- **Stats Displayed**:
  - Total Facilities
  - Total Commitment
  - Funded Amount
  - Outstanding Amount
  - Active Deals

---

#### 4. **Investment Detail Page** (`/investments/:investmentId`)
**File**: `src/components/InvestmentDetailPage.tsx`
- **Description**: Detailed investment management with tabs
- **Tabs**:
  1. **Investment Data**: General investment information
  2. **Static Data**: Static configuration data
  3. **Events Tracker**: Link to BAU operations
  4. **Covenant Tracking**: Embedded covenant tracking
  5. **Portfolio Tracking**: Investment-level portfolio view
  6. **Reporting Requirements**: Reporting schedule management
- **Features**:
  - Add/Edit/Delete facilities
  - Multiple facility management
  - Cashflow schedule generation
  - Covenant visualization
  - Reporting requirements input
  - Donut chart display

---

#### 5. **Deal Detail Page** (`/deals/:dealId`)
**File**: `src/components/DealDetailPage.tsx`
- **Description**: Deal-level information view
- **Tabs**:
  1. **General Information**: Deal basics
  2. **Investor Share**: Investor allocations
  3. **Commitment Terms**: Financial commitments
  4. **Covenant Summary**: Covenant overview
  5. **Reporting Tracker**: Reporting status
- **Features**: Mock data display, export functionality

---

#### 6. **Facility Detail Page** (`/facilities/:facilityId`)
**File**: `src/components/FacilityDetailPage.tsx`
- **Description**: Most complex page - comprehensive facility management
- **Features**:
  - **General Terms**: Agreement dates, maturity, commitments
  - **Interest Details**: Interest types, rates, conventions
  - **Drawdown Management**: Add/manage drawdowns
  - **Amortization Schedule**: Create and manage amortization
  - **Cashflow Schedule**: Generate comprehensive schedules
  - **Advanced Cashflow Engine**: Custom scheduling algorithm
  - **Export**: Excel download of schedules
- **State Management**: Large form with multiple sections
- **Cashflow Engine**: Advanced scheduling with business day adjustments

---

#### 7. **Covenant Tracking** (`/covenant-tracking`)
**File**: `src/components/CovenantTrackingPage.tsx`
- **Description**: Upload and monitor covenant compliance
- **Features**:
  - Upload PDF or Excel compliance certificates
  - Auto-parse covenant data
  - Timeline view of covenant periods
  - Compliance status tracking
  - Save and manage entries
  - Period-based organization
- **Supported Formats**: PDF, XLSX, CSV
- **Key Fields**: Covenant Name, Threshold, Borrower/Lender Calcs, Compliance Status

---

#### 8. **BAU Operations** (`/bau`)
**File**: `src/components/BauTab.tsx`
- **Description**: Business As Usual operations tracker
- **Tabs**:
  1. **Prepayment**: Track prepayment events
  2. **Change of Investor**: Manage investor transfers
  3. **Commitment Downsize**: Record commitment reductions
  4. **Commitment Upsize**: Record commitment increases
  5. **Multi-Currency Mechanisms**: Currency adjustments
- **Features**: Form-based data entry for each BAU type

---

#### 9. **Cash Terms Page** (`/facilities/:facilityId/cash-terms`)
**File**: `src/components/CashTermsPage.tsx`
- **Description**: Display cash terms configuration
- **Sections**: x 
  - General Terms
  - Configuration
  - Day One Funding
  - Default Options
  - Additional Options
- **Currently**: Mock data display

---

#### 10. **Admin Dashboard** (`/admin`)
**File**: `src/components/AdminDashboard.tsx`
- **Description**: Admin management (Super Admin only)
- **Features**:
  - Dashboard statistics
  - Admin management tools
  - Database setup
  - Debug tools
- **Access**: Requires `manage_admins` permission

---

#### 11. **Database Setup** (`/setup`)
**File**: `src/components/DatabaseSetup.tsx`
- **Description**: Initial database configuration
- **Features**: Configure database connections

---

### Investment Detail Sub-Components

#### **CovenantTab** (`src/components/investment-detail/CovenantTab.tsx`)
- Covenant compliance view with charts
- Timeline visualization
- Period-based display

#### **ReportingRequirementsTab** (`src/components/investment-detail/ReportingRequirementsTab.tsx`)
- Reporting schedule display
- Chart visualization
- Auto-generate functionality

#### **Reportinginput** (`src/components/investment-detail/Reportinginput.tsx`)
- Detailed reporting requirements form
- Schedule generation
- Backend integration

---

## 🔌 Backend API Structure

### Base URL: `http://127.0.0.1:5000/api`

### Health & System
- `GET /health` - Health check endpoint

### Covenant Endpoints
- `GET /covenants?calc_date=YYYY-MM-DD` - List covenant entries
- `POST /covenants` - Save covenant entries
- `POST /covenants/upload` - Upload PDF compliance certificate
- `GET /covenants/parse?doc_id=X&path=X` - Parse existing PDF
- `PUT /covenants/:entry_id` - Update covenant entry

### Portfolio-Scoped Endpoints
- `GET /portfolio/:portfolio_id/covenants?date=YYYY-MM-DD` - Get covenant periods
- `POST /portfolio/:portfolio_id/covenants/upload-excel` - Upload Excel covenant file
- `POST /portfolio/:portfolio_id/covenants/upload-pdf` - Upload PDF covenant file
- `PUT /portfolio/:portfolio_id/covenants/period/:period_id` - Update period

### Reporting Endpoints
- `GET /reporting?facility_id=X&investment_name=X` - List reporting requirements
- `POST /reporting` - Save reporting requirements

---

## 🗄️ Database Schema

### Main Tables (`backend/models.py`)

#### **CovenantEntry** (Legacy)
- id, calc_date, covenant_name
- threshold, borrower_calc, lender_calc
- consequence, compliance_check, comment
- source_file, reference_file, pdf_path

#### **CovenantPeriod** (Portfolio-scoped)
- id, portfolio_id, ipd_date, display_name
- template_status, source, is_provisional
- provisional_start_date, report_link
- created_at, updated_at

#### **CovenantEntryV2** (New schema)
- id, period_id, covenant_name
- threshold, borrower_calc, lender_calc
- consequence, compliance_check, comment
- source_file, reference_file, document_id

#### **Document**
- id, portfolio_id, filename, path
- doc_type, uploaded_at

#### **CovenantTemplate**
- id, name, description

---

## ✨ Key Features

### 1. **Authentication & Authorization**
- Custom auth system with role-based access
- Roles: super_admin, admin, user
- Permission-based routing
- Session management

### 2. **Covenant Parsing**
- PDF parsing with OCR support
- Excel/CSV parsing
- Automatic data extraction
- Multiple covenant tracking
- Compliance status calculation

### 3. **Cashflow Engine**
- Advanced scheduling algorithm
- Business day adjustments
- Multiple frequency options
- Interest calculations
- Amortization support
- Export to Excel

### 4. **Portfolio Analytics**
- Bloomberg-style summaries
- Visual charts (Donut, Line, Bar)
- Real-time statistics
- Multi-deal aggregation
- Facility-level drilling

### 5. **Transaction Management**
- Comprehensive CRUD operations
- Flexible data entry
- Search and filter
- Link to related entities

### 6. **Reporting System**
- Schedule generation
- Automatic date calculation
- Frequency-based schedules
- Email notifications (planned)
- Business day handling

---

## 📂 File Organization

### Frontend Components

#### Core Pages
- `MainPage.tsx` - Dashboard
- `TransactionsPage.tsx` - Transaction management
- `PortfolioTrackingPage.tsx` - Portfolio overview
- `InvestmentDetailPage.tsx` - Investment details
- `FacilityDetailPage.tsx` - Facility management
- `DealDetailPage.tsx` - Deal information
- `CovenantTrackingPage.tsx` - Covenant monitoring
- `BauTab.tsx` - BAU operations
- `CashTermsPage.tsx` - Cash terms display
- `AdminDashboard.tsx` - Admin panel

#### Investment Detail Sub-Components
- `investment-detail/CovenantTab.tsx`
- `investment-detail/ReportingRequirementsTab.tsx`
- `investment-detail/Reportinginput.tsx`

#### UI Components
- `ui/Card.tsx`, `ui/Button.tsx`, `ui/Input.tsx`
- `ui/Table.tsx`, `ui/Dialog.tsx`, `ui/Tabs.tsx`
- `ui/DonutChart.tsx`, `ui/IdentifierStrip.tsx`
- `ui/ExcelIcon.tsx`, `ui/Badge.tsx`

#### Context Providers
- `AuthContext.tsx` - Authentication
- `SupabaseDataContext.tsx` - Data management
- `DataContext.tsx` - Legacy data

#### Libraries
- `lib/auth.ts` - Authentication service
- `lib/covenantApi.ts` - Covenant API calls
- `lib/database.ts` - Database service
- `lib/advanced-cashflow-engine.js` - Cashflow calculator
- `lib/utils.ts` - Utilities
- `lib/theme.tsx` - Theme management

---

### Backend

#### Core Files
- `app.py` - Main Flask application with routes
- `models.py` - SQLAlchemy ORM models
- `db.py` - Database initialization
- `parse_covenant.py` - PDF/Excel parsing logic

#### Uploads
- `uploads/` - Temporary file storage
- PDF, Excel, and CSV files

---

## 🔄 Data Flow

### Covenant Tracking Flow
1. User uploads PDF/Excel via `/covenant-tracking`
2. Backend parses file using `parse_covenant.py`
3. Data extracted and structured
4. Saved to database (CovenantPeriod + CovenantEntryV2)
5. Displayed in timeline view
6. Charts generated for visualization

### Investment Management Flow
1. Transaction created via `/transactions`
2. Facilities added via Investment Detail page
3. Cashflow schedules generated via Facility Detail
4. Covenants tracked via Covenant Tab
5. Reporting requirements managed
6. Portfolio aggregated via Portfolio Tracking

### Cashflow Generation Flow
1. Facility details entered
2. Interest parameters configured
3. Drawdowns/Amortizations added
4. Advanced cashflow engine generates schedule
5. Schedule displayed in editable table
6. Export to Excel available

---

## 🚀 Running the Application

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm/package manager

### Setup Commands
```bash
# Install frontend dependencies
npm install

# Setup backend (Windows)
npm run setup:backend

# Run both frontend and backend
npm run dev:all

# Or run separately
npm run dev              # Frontend only
npm run dev:backend      # Backend only
```

### Default Ports
- Frontend: `http://localhost:5173`
- Backend: `http://127.0.0.1:5000`

---

## 📝 Key Configuration Files

- `package.json` - Frontend dependencies and scripts
- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - TailwindCSS configuration
- `tsconfig.json` - TypeScript configuration
- `backend/requirements.txt` - Python dependencies
- `vercel.json` - Deployment configuration
- `railway.json` - Railway deployment config
- `Procfile` - Process file for production

---

## 🔐 Authentication

### User Roles
- **Super Admin**: Full access including admin management
- **Admin**: Data management and configuration
- **User**: Read/write access to own data

### Permissions
- `manage_admins` - Admin management
- `manage_data` - Data CRUD operations
- `view_dashboard` - Dashboard access

---

## 📊 Data Models

### Investment
- ID, name, type, status
- Dates, amounts, currencies
- Risk factors, ratings

### Transaction
- Deal information
- Issuer details
- Sponsors, deal types
- Status and dates

### Facility
- General terms
- Interest configuration
- Drawdowns/Amortizations
- Cashflow schedules
- Links to transaction/investment

### Covenant Entry
- Covenant name and thresholds
- Borrower/lender calculations
- Compliance status
- Comments and references

### Reporting Requirement
- Type and description
- Obligor information
- Frequency and dates
- Schedule entries

---

## 🎯 Future Enhancements

- Email notifications for reporting
- Advanced analytics dashboard
- Real-time data feeds
- Multi-currency support
- Document management system
- Enhanced search capabilities
- Mobile responsive optimization
- API for external integrations

---

This comprehensive overview covers all major aspects of the AltMonitor platform. The application serves as a complete investment banking management system with emphasis on covenant compliance, portfolio tracking, and cashflow analysis.
