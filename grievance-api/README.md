# Grievance Portal API

A minimal FastAPI-based municipal grievance management system with AI-powered classification using ChatGroq and MongoDB.

## Features

- **JWT Authentication**: Role-based access control (citizen, admin, superadmin)
- **AI Classification**: Automatic grievance categorization using ChatGroq LLM
- **Department Routing**: Smart routing to appropriate municipal departments
- **Admin Dashboard**: Department-filtered grievance management
- **Async MongoDB**: High-performance async database operations with Motor
- **Docker Ready**: Complete containerization with docker-compose

## Tech Stack

- **FastAPI** - Modern async web framework
- **Motor** - Async MongoDB driver
- **LangChain + ChatGroq** - AI-powered classification
- **JWT** - Secure authentication
- **Docker** - Containerization
- **Python 3.11** - Latest stable Python

## Project Structure

```
grievance-api/
├── app/
│   ├── core/
│   │   ├── config.py          # Environment configuration
│   │   ├── database.py        # MongoDB setup
│   │   └── security.py        # JWT & password utilities
│   ├── routes/
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── grievance.py      # Citizen grievance endpoints
│   │   └── admin.py          # Admin endpoints
│   ├── services/
│   │   └── classification_service.py  # AI classification
│   ├── main.py               # FastAPI application
│   ├── schemas.py            # Pydantic models
│   └── utils.py              # Utility functions
├── scripts/
│   └── seed_departments.py   # Database seeding
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── .env.example
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Python 3.11+ (for local development)
- Groq API key ([Get one here](https://console.groq.com))

### 1. Clone & Setup

```bash
cd grievance-api
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your_random_secret_key_here
```

### 2. Run with Docker

```bash
# Build and start services
docker-compose up --build

# Or run in detached mode
docker-compose up -d
```

The API will be available at `http://localhost:8000`

### 3. Seed Database & Create Superadmin

```bash
# Seed departments
docker-compose exec api python -m scripts.seed_departments

# Create initial superadmin
docker-compose exec api python -m scripts.seed_departments \
  --create-superadmin email=admin@example.com password=SecurePass123
```

### 4. Access API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user (citizens), or create admin users (superadmin only)
- `POST /api/auth/login` - Login and get JWT token

### Grievances (Citizen)

- `POST /api/grievances` - Submit new grievance (auto-classified)
- `GET /api/grievances/my-grievances` - Get my submitted grievances
- `GET /api/grievances/{id}` - Get specific grievance details

### Admin

- `GET /api/admin/grievances` - List grievances (filtered by department)
- `PATCH /api/admin/grievances/{id}/status` - Update grievance status

### System

- `GET /health` - Health check
- `GET /` - API information

## User Roles

### Citizen
- Self-register via `/api/auth/register`
- Submit grievances
- View own grievances

### Admin
- Created by superadmin only
- Assigned to specific departments
- View and update grievances for assigned departments only

### Superadmin
- Created via seed script
- Full access to all departments
- Can create other admins and superadmins

## Department Categories

The system supports these departments:
- `water` - Water Supply (SLA: 24h)
- `sanitation` - Sanitation & Waste (SLA: 48h)
- `roads` - Roads & Infrastructure (SLA: 72h)
- `electricity` - Electricity (SLA: 12h)
- `health` - Public Health (SLA: 24h)
- `police` - Police & Safety (SLA: 2h)
- `housing` - Housing & Building (SLA: 120h)
- `general` - General Services (SLA: 96h)
- `miscellaneous` - Other issues (SLA: 168h)

## AI Classification

The system uses ChatGroq (via LangChain) to automatically classify grievances:

- **Department**: Predicted department
- **Priority**: high/medium/low
- **Confidence**: 0.0-1.0 score
- **Explanation**: One-sentence rationale

### Fallback System

If the AI service is unavailable or returns invalid output, a keyword-based fallback classifier ensures the system continues to function.

## Example Usage

### 1. Register as Citizen

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "citizen@example.com",
    "password": "password123",
    "role": "citizen"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "citizen@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### 3. Submit Grievance

```bash
curl -X POST http://localhost:8000/api/grievances \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Water main burst on Main Street, multiple houses flooded"
  }'
```

Response:
```json
{
  "id": "65abc123...",
  "user_id": "65xyz456...",
  "message": "Water main burst on Main Street, multiple houses flooded",
  "predicted_department": "water",
  "priority": "high",
  "confidence": 0.95,
  "explanation": "burst main flooding homes—immediate emergency for water department",
  "status": "submitted",
  "created_at": "2026-02-26T10:30:00",
  "updated_at": "2026-02-26T10:30:00"
}
```

### 4. Admin: Update Status

```bash
curl -X PATCH http://localhost:8000/api/admin/grievances/65abc123.../status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "status": "in_progress"
  }'
```

## Local Development (Without Docker)

### 1. Install Dependencies

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Start MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongo mongo:7.0

# Or use local MongoDB installation
```

### 3. Set Environment Variables

```bash
export MONGO_URI=mongodb://localhost:27017
export MONGO_DB=grievance_db
export JWT_SECRET=your_secret_key
export GROQ_API_KEY=your_groq_key
```

### 4. Seed Database

```bash
python -m scripts.seed_departments
python -m scripts.seed_departments --create-superadmin email=admin@example.com password=admin123
```

### 5. Run Application

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGO_DB` | Database name | `grievance_db` |
| `JWT_SECRET` | Secret key for JWT signing | `change_me_in_production` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT expiration time | `1440` (24 hours) |
| `GROQ_API_KEY` | Groq API key | (required for AI) |
| `GROQ_MODEL` | Groq model name | `mixtral-8x7b-32768` |
| `GROQ_TIMEOUT` | API timeout in seconds | `30` |

## Testing

Access the interactive API documentation at `http://localhost:8000/docs` to test all endpoints.

## Production Considerations

- Change `JWT_SECRET` to a strong random value
- Configure CORS origins in `app/main.py`
- Use environment-specific `.env` files
- Set up MongoDB authentication
- Implement rate limiting
- Enable HTTPS/TLS
- Set up monitoring and logging
- Configure backup strategies

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
docker-compose ps

# View logs
docker-compose logs mongo
```

### API Not Starting
```bash
# View API logs
docker-compose logs api

# Rebuild containers
docker-compose down
docker-compose up --build
```

### Classification Errors
- Verify `GROQ_API_KEY` is set correctly
- Check API quota/limits
- System falls back to keyword-based classification if AI fails

## License

MIT

## Support

For issues and questions, please check the API documentation at `/docs` or review the code comments.
