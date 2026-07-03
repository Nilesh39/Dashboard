# Instagram Analytics Automation Dashboard

A high-fidelity, production-ready, dark-themed SaaS analytics dashboard. Inspired by Instagram Reel Insights, this dashboard enables admins to view, edit, duplicate, and delete reel metrics, simulate real-time follower growth, and configure brand color palettes using a built-in Theme Builder.

---

## Technical Architecture

The project is split into two components:
- **`backend/`**: Built with Python FastAPI, SQLite (via SQLAlchemy), and APScheduler.
- **`frontend/`**: Built with React (Vite), Tailwind CSS, Recharts, and Axios.

### Key Features
1. **Fully Editable Analytics System**: Every single metric on screen (followers count, reel views, shares, country weights, gender splits) can be clicked and edited in-place in "Edit Mode". Unsaved modifications are recorded in a state history stack supporting **Undo (Ctrl+Z style), Redo, Reset, and Save**.
2. **Live Growth Simulation Engine**: A background cron checks time intervals to proportionally add followers, views, likes, and shares. Additionally, a frontend micro-tick simulates live growth on screen (counting up figures every few seconds).
3. **Brand Theme Builder**: A dynamic panel to alter background colors, highlights, card layouts (e.g., Glassmorphism, Neon Glow), and font typography at runtime. Changes update Recharts graphs and cards instantly.
4. **Demo Data Generator**: Generate mock datasets scaled realistically for 1K, 10K, 100K, 1M, or 10M followers.

---

## Directory Layout
```
/
├── backend/
│   ├── app/
│   │   ├── api/             # API Router endpoints (Profile, Reels, Audience, Logs)
│   │   ├── database.py      # SQLAlchemy engine provider
│   │   ├── models.py        # Database models (SQLite/PostgreSQL schema)
│   │   ├── schemas.py       # Pydantic schemas and string suffix parsers
│   │   ├── crud.py          # CRUD helper operations & demo data scaling math
│   │   ├── scheduler.py     # Background Cron Sync scheduler (every 30 mins)
│   │   ├── simulation.py    # Math growth formulas for simulation catch-up
│   │   └── main.py          # FastAPI application initialization
│   ├── requirements.txt     # Python backend dependencies
│   └── run.py               # FastAPI dev runner script
├── frontend/
│   ├── src/
│   │   ├── components/      # Common components (MetricEditor, Sidebar, StatCard)
│   │   ├── context/         # React contexts (ThemeContext, EditContext for Undo/Redo)
│   │   ├── pages/           # Pages (Overview, Reels, Demographics, Logs, Settings)
│   │   ├── services/        # Axios backend API client
│   │   ├── utils/           # Helper scripts (formatters K/M/B)
│   │   ├── App.jsx          # Route declarations
│   │   └── index.css        # Glassmorphic utilities and animations
│   ├── tailwind.config.js   # Tailwind custom variable bindings
│   └── package.json         # React frontend dependencies
└── README.md
```

---

## Database Schemas

We create the following tables in SQLite (`instagram_analytics.db`):
- `instagram_accounts`: Current profile information, username, and custom theme layouts.
- `reels`: Catalog of reels, watch times, reach, likes, comments, and saves.
- `analytics_history`: Chronological historical log of daily follower snapshots.
- `audience_insights`: Country splits, age groups, and gender balances.
- `automation_settings`: Tracks simulation triggers and daily growth rates.
- `automation_logs`: Execution terminal logs of scheduler activities.

---

## Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+

### 1. Run the Python Backend
Open a terminal in the `backend/` directory:
```bash
# Navigate to backend
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
# Activate it:
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the dev server
python run.py
```
The backend API will start at **`http://localhost:8000`**. You can browse the interactive Swagger docs at `http://localhost:8000/docs`.

### 2. Run the React Frontend
Open a separate terminal in the `frontend/` directory:
```bash
# Navigate to frontend
cd frontend

# Install package dependencies
npm install

# Run the Vite dev server
npm run dev
```
The React frontend dashboard will start at **`http://localhost:5173`**.

---

## User Instructions

### Editing Metrics
1. Toggle the **"Enable Edit Mode"** switch in the sidebar.
2. Click any metric on the page (e.g. followers count in the header, views in the Reels list, or age group rates).
3. The number swaps to a textbox. Enter integers or custom strings (e.g., `1.5M`, `10.3M`, `500`, `12K`).
4. Press `Enter` or click away to save.
5. Click **Undo**, **Redo**, **Reset**, or **Save Changes** in the bottom panel.

### Customizing Theme
1. Navigate to **"Settings & Theme"** in the sidebar.
2. Select custom primary, secondary, text, or background colors.
3. Switch card containers to **"Neon glow"** or **"Minimal Border"** and click **"Save & Apply Theme"**.
