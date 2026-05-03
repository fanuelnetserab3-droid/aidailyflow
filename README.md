# AiDailyFlow

En personlig AI-livscoach app på svenska. Byggd med React + FastAPI + Claude AI.

## Kom igång

### 1. Förutsättningar

- Python 3.10+
- Node.js 18+
- Ett Anthropic API-nyckel (skaffa på https://console.anthropic.com)

### 2. Miljövariabler

```bash
cp .env.example backend/.env
```

Öppna `backend/.env` och fyll i:

```
ANTHROPIC_API_KEY=sk-ant-...
SECRET_KEY=valfri-lång-hemlig-sträng
```

### 3. Starta backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend körs på http://localhost:8000

### 4. Starta frontend

```bash
cd frontend
npm install
npm start
```

Frontend körs på http://localhost:3000

---

## Funktioner

| Sida     | Beskrivning                                          |
|----------|------------------------------------------------------|
| **Idag** | Dagens schema med checkboxar, framstegsbar och veckoremsa |
| **Flow** | AI-chat med personlig profil-onboarding (10 frågor) |
| **Tankar** | Enkel anteckningsvy för snabba tankar             |
| **Listor** | Checklistor med fleranivå-uppgifter              |
| **Vanor** | Veckorutnät för vanetracking med streak-räknare   |

## API-endpoints

| Metod | URL | Beskrivning |
|-------|-----|-------------|
| POST | `/api/auth/register` | Registrera konto |
| POST | `/api/auth/login` | Logga in |
| GET/POST | `/api/profile` | Hämta/uppdatera profil |
| POST | `/api/chat` | Skicka meddelande till AI |
| GET/PUT | `/api/schedule/{date}` | Schema för en dag |
| GET/POST/DELETE | `/api/thoughts` | Tankar |
| GET/POST/PUT/DELETE | `/api/lists` | Listor |
| GET/POST/PUT/DELETE | `/api/habits` | Vanor |

## Teknikstack

- **Frontend**: React 18, Vite, React Router, Axios
- **Backend**: FastAPI, SQLAlchemy, SQLite, JWT-auth
- **AI**: Anthropic Claude (claude-sonnet-4-6)
