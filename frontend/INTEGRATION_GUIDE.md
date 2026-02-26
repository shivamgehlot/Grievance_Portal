# Frontend-Backend Integration Guide

## ✅ Integration Complete

The Next.js frontend has been successfully integrated with the FastAPI backend.

## 🔄 Changes Made

### 1. API Service Layer (`/lib/api.ts`)
Created a complete API service layer with:
- Authentication endpoints (login, register)
- Grievance endpoints (create, getMyGrievances, getById)
- Admin endpoints (getGrievances, updateStatus)
- Token management utilities
- JWT decoding functions

### 2. Type Definitions (`/types/index.ts`)
Updated to match backend API:
- Changed role types: `'citizen' | 'admin' | 'superadmin'`
- Updated department IDs to match backend
- Added department mapping between backend IDs and display names
- Updated Grievance interface to match API response
- Added status and priority display mappings

### 3. Authentication (`/context/AuthContext.tsx`)
- Integrated with real backend API
- Added JWT token management
- Token validation and expiration checking
- Automatic user data extraction from JWT

### 4. Pages Updated

#### Login Page (`/app/login/page.tsx`)
- Simplified form (removed department selection)
- Integrated with backend auth API
- Updated demo credentials
- Role-based routing after login

#### Register Page (`/app/register/page.tsx`)
- Simplified to match backend requirements (email + password only)
- Integrated with backend registration API
- Automatic token saving and redirect

#### User Dashboard (`/app/user/dashboard/page.tsx`)
- Simplified grievance submission (just message field)
- AI auto-classification displayed
- Real-time data from backend API
- Shows confidence scores
- Updated table columns

### 5. Components Updated

#### ProtectedRoute (`/components/ProtectedRoute.tsx`)
- Updated role names to match backend
- Added loading state handling

#### Sidebar (`/components/Sidebar.tsx`)
- Updated role display names

### 6. Environment Configuration
Created `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🎯 Department Mapping

Backend uses simple IDs, frontend shows user-friendly names:

| Backend ID | Frontend Display |
|------------|------------------|
| water | Water Supply |
| sanitation | Sanitation & Waste |
| roads | Roads & Infrastructure |
| electricity | Electricity |
| health | Public Health |
| police | Police & Safety |
| housing | Housing & Building |
| general | General Services |
| miscellaneous | Miscellaneous |

## 🔐 Authentication Flow

1. User logs in → Backend returns JWT token
2. Token saved in localStorage
3. Token includes: `sub` (user_id), `role`, `department_ids`
4. All subsequent API calls include `Authorization: Bearer <token>`
5. Frontend extracts user info from decoded JWT

## 📝 API Endpoints Used

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register citizen

### Grievances
- `POST /api/grievances` - Submit grievance
- `GET /api/grievances/my-grievances` - Get user's grievances
- `GET /api/grievances/{id}` - Get specific grievance

### Admin
- `GET /api/admin/grievances` - List grievances (filtered)
- `PATCH /api/admin/grievances/{id}/status` - Update status

## 🚀 How to Run

### Backend (FastAPI)
```bash
cd grievance-api
.\venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (Next.js)
```bash
cd frontend
npm install  # if not already done
npm run dev
```

Frontend will be available at: http://localhost:3000
Backend API at: http://localhost:8000
API Docs at: http://localhost:8000/docs

## 👤 Test Credentials

**Superadmin:**
- Email: `admin@example.com`
- Password: `Admin123!`

**New Citizens:**
- Can register directly via `/register`

## 🔄 Workflow

1. **Citizen Flow:**
   - Register → Auto login → Submit grievance
   - AI classifies grievance automatically
   - View status updates in dashboard

2. **Admin Flow:**
   - Login with admin credentials
   - See grievances for assigned departments
   - Update grievance status (in_progress, resolved, rejected)

3. **Superadmin Flow:**
   - Login with superadmin credentials
   - See all grievances across departments
   - Create new admin users

## ⚠️ Important Notes

1. **CORS**: Backend has CORS enabled for `*` (change in production)
2. **Security**: Update JWT_SECRET in production
3. **Mock Data**: Old mock data is no longer used
4. **Department Assignment**: Automatic via AI classification
5. **Token Expiration**: 24 hours (configured in backend)

## 📊 What Still Uses Mock Data

Some pages may still reference mock data if not updated:
- Individual grievance detail page (`/user/grievances/[id]`)
- Admin analytics pages
- Super admin pages

These can be updated similarly by:
1. Adding API endpoints to `/lib/api.ts`
2. Fetching data with `useEffect` in components
3. Replacing mock data with real API responses

## 🔧 Troubleshooting

**"Module not found" errors:**
- Run `npm install` in frontend directory

**"Network Error" or "Failed to fetch":**
- Ensure backend is running on port 8000
- Check `.env.local` has correct API_URL

**Authentication errors:**
- Clear localStorage: `localStorage.clear()` in browser console
- Re-login with correct credentials

**CORS errors:**
- Backend already configured for CORS
- If issues persist, check browser console for details

## 🎨 UI Features Preserved

- Clean, minimal design with Tailwind CSS
- Responsive layout
- Role-based navigation
- Protected routes
- Loading states
- Error handling and display
- Success notifications

## 📦 Next Steps

Consider implementing:
1. Pagination for large grievance lists
2. Search and filter capabilities
3. File upload for grievances
4. Real-time notifications
5. Email notifications
6. Analytics dashboards
7. Admin management interface for superadmin
