# KejaKU — Fullstack Student Housing Platform

A fullstack web application designed for Kenyatta University (KU) students to search and list verified student rooms, bedsitters, and hostels in Kahawa Wendani, Kahawa Sukari, Ruiru, and KU Main Gate (KM).

---

## 📁 Project Structure

```
keja/
├── backend/                       # Node.js + Express REST API Server
│   ├── data/
│   │   ├── houses.json            # Persistent JSON database
│   │   ├── houses.js              # Data access layer
│   │   └── enquiries.json         # Viewing requests store
│   ├── routes/
│   │   ├── houses.js              # REST endpoints for property listings
│   │   └── enquiries.js           # REST endpoints for booking viewings
│   ├── package.json               # Backend dependencies (express, cors)
│   └── server.js                  # Main server entry & static frontend host
│
├── frontend/                      # Modular Frontend Web App
│   ├── css/
│   │   ├── variables.css          # Design system color tokens & typography
│   │   ├── base.css               # Typography, buttons & badges
│   │   ├── navbar.css             # Glassmorphism header with saved counter
│   │   ├── hero.css               # Hero banner & instant search card
│   │   ├── filters.css            # Sidebar filters, chips & price slider
│   │   ├── cards.css              # Listing cards, pricing & amenity chips
│   │   ├── modal.css              # Modal dialogs & booking forms
│   │   ├── toast.css              # Notification toasts
│   │   ├── footer.css             # How-it-works guide & footer
│   │   └── style.css              # Master CSS aggregator
│   ├── js/
│   │   ├── api.js                 # API service (with offline fallback)
│   │   ├── bundle.js              # Standalone universal application bundle
│   │   ├── app.js                 # ES6 Module application orchestrator
│   │   ├── components/            # Reusable UI components
│   │   │   ├── card.js            # Card rendering & Kenyan shilling format
│   │   │   ├── filters.js         # Multi-criteria filter & sort logic
│   │   │   ├── modal.js           # Property details & enquiry modal
│   │   │   ├── saved.js           # Bookmarks / Favorites system
│   │   │   └── toast.js           # Toast alerts
│   │   └── data/
│   │       └── houses.js          # Client-side fallback data
│   └── index.html                 # Semantic HTML5 entry page
│
└── package.json                   # Root package scripts
```

---

## 🚀 How to Run

### Option 1: Run Fullstack (Frontend + Backend Together)
The backend server automatically hosts the frontend static files as well as the REST API:
```bash
cd keja
npm start
```
Then visit: **`http://localhost:5000`** in your browser.

- **Frontend:** `http://localhost:5000`
- **REST API:** `http://localhost:5000/api/houses`
- **Health Check:** `http://localhost:5000/api/health`

### Option 2: Open Frontend Standalone
You can also directly open `keja/frontend/index.html` in any browser or run with a local static server. It will automatically connect to the backend if running, or gracefully use local storage if offline.
