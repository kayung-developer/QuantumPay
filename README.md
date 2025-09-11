# QuantumPay - The Financial Super-App

QuantumPay is a hyper-secure, AI-powered global payment system designed to be a comprehensive financial super-app. It seamlessly integrates a robust payment infrastructure with advanced tools for personal finance, business commerce, and corporate treasury management, rivaling and exceeding the capabilities of modern FinTech solutions.

## ✨ Key Features

- **Hyper-Secure Infrastructure**: Firebase-powered authentication, real-time AI fraud detection, and robust role-based access control (User, Admin, Superuser).
- **Global Multi-Currency Wallet**: Manage and transact with multiple fiat currencies in a centralized, secure wallet.
- **Instantaneous P2P Transfers**: Globally send and receive funds with transactions settling in seconds.
- **AI-Powered Financial Intelligence**:
    - **Fraud Shield**: Proactively flags and blocks fraudulent activity in real-time.
    - **Dynamic Credit Scoring**: A live credit score for every user based on their financial health.
- **Complete Merchant Suite**: Includes a digital product catalog, software Point-of-Sale (POS) system, and foundational CRM.
- **Comprehensive Admin & Superuser Panels**: Full control over user management, KYC approvals, and platform oversight.
- **Developer Ready**: Secure, key-based API access for third-party integrations (foundation).

## 🛠️ Tech Stack

-   **Backend**:
    -   **Framework**: FastAPI
    -   **Database**: SQLAlchemy ORM with SQLite
    -   **Authentication**: Firebase Admin SDK
    -   **AI/ML**: Scikit-learn, Pandas, NumPy
    -   **Language**: Python 3.10+
-   **Frontend**:
    -   **Framework**: React 18
    -   **Styling**: Tailwind CSS with Framer Motion for animations
    -   **State Management**: React Context API (`AuthContext`)
    -   **API Communication**: Axios
    -   **Forms**: Formik & Yup
    -   **Language**: JavaScript (ES6+)

## 📁 Project Structure

```
.
├── frontend/             # React Frontend Application
│   ├── public/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       ├── App.js
│       └── index.js
├── main.py               # All-in-one FastAPI Backend
├── readme.md             # This file
├── requirements.txt      # Backend Python dependencies
├── .env.example          # Backend environment variable template
└── .gitignore            # Git ignore rules for the project
```

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   **Python**: Version 3.10 or newer.
-   **Node.js**: Version 16.x or newer, along with `npm` or `yarn`.
-   **Firebase Project**: A Google Firebase project is required for user authentication.

---

### ⚙️ Setup & Installation

#### Step 1: Clone the Repository

Clone this project to your local machine.

```bash
git clone <your-repository-url>
cd <repository-folder>
```

#### Step 2: Backend Setup (Root Folder)

1.  **Create a Virtual Environment**:
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # On Windows, use: .venv\Scripts\activate
    ```

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Configure Environment Variables**:
    -   Copy the example environment file:
        ```bash
        cp .env.example .env
        ```
    -   Open the `.env` file and fill in the required values. See the **Superuser Setup** section below for instructions on getting `SUPERUSER_EMAIL` and `SUPERUSER_FIREBASE_UID`.

#### Step 3: Frontend Setup (`frontend/` folder)

1.  **Navigate to the Frontend Directory**:
    ```bash
    cd frontend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    -   Open the `frontend/.env` file.
    -   Go to your **Firebase Project Settings** > **General** > **Your apps**.
    -   Find your Web App and copy the **Firebase SDK snippet** config values into the `.env` file.
    -   Ensure `REACT_APP_API_BASE_URL` is set to `http://127.0.0.1:8000`.

---

### 🔑 Superuser Setup (Critical Step)

The first superuser account must be created manually to gain initial administrative access.

1.  **Create a User in Firebase**: Go to your Firebase Console > Authentication > Users > Add user. Create a user with an email and password.
2.  **Get the User UID**: After creating the user, copy their **User UID** from the user table.
3.  **Update Backend `.env`**:
    -   Set `SUPERUSER_EMAIL` to the email you just created.
    -   Set `SUPERUSER_FIREBASE_UID` to the UID you just copied.

When you run the backend for the first time, it will automatically find this user in the database (or create them) and promote them to the `superuser` role.

---

### ▶️ Running the Application

You need to run both the backend and frontend servers in separate terminals.

1.  **Start the Backend Server** (from the root project directory):
    ```bash
    uvicorn main:app --reload
    ```
    The API will be available at `http://127.0.0.1:8000`.

2.  **Start the Frontend Server** (from the `frontend` directory):
    ```bash
    npm start
    ```
    The application will open in your browser at `http://localhost:3000`.

### 📚 API Documentation

Once the backend server is running, you can access the interactive OpenAPI (Swagger) documentation for the entire API at:

[**http://127.0.0.1:8000/docs**](http://127.0.0.1:8000/docs)
```

---

### File 45 of X: `requirements.txt`

This file lists all the Python dependencies for the backend. It should be placed in the root directory of the project.

```
fastapi
uvicorn[standard]
sqlalchemy
pydantic
pydantic-settings
firebase-admin
bcrypt
python-jose[cryptography]
scikit-learn
pandas
numpy
httpx
```

---

### File 46 of X: `.env.example`

This file serves as a template for the backend's environment variables. Users will copy this to a `.env` file and fill in their own secrets. It should be placed in the root directory.

```
# --- Application Configuration ---
# The secret key is used for signing JWTs and other security-related functions.
# Generate a strong key using: openssl rand -hex 32
SECRET_KEY="a_very_secret_key_for_jwt_and_webhooks_that_is_long_and_secure"

# --- Database Configuration ---
# The default is a local SQLite database file.
# For production, use a PostgreSQL or MySQL connection string.
# Example: DATABASE_URL="postgresql://user:password@host:port/dbname"
DATABASE_URL="sqlite:///./quantumpay.db"

# --- Superuser Configuration (CRITICAL FOR FIRST RUN) ---
# This user will be granted Superuser privileges on the first startup.
# Create this user in your Firebase project first, then copy the email and UID here.
SUPERUSER_EMAIL="your_admin_email@example.com"
SUPERUSER_FIREBASE_UID="your_firebase_admin_uid"

# --- Firebase Admin SDK Configuration ---
# NOTE: The main.py file expects a placeholder Firebase credential dictionary.
# In a real production system, you would securely provide your service account JSON key.
# For example, you could base64 encode the entire JSON file and store it here.
# FIREBASE_SERVICE_ACCOUNT_KEY_B64=""

# --- Payment Gateway API Keys (Placeholders) ---
PAYSTACK_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
PAYPAL_CLIENT_ID="paypal_client_id_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
PAYPAL_CLIENT_SECRET="paypal_client_secret_xxxxxxxxxxxxxxxxxxxxxxxx"

# --- CORS Configuration ---
# A comma-separated list of allowed origins.
# The default in main.py is "http://localhost:3000".
# Example: CORS_ORIGINS="http://localhost:3000,https://your-production-domain.com"
```

---

### File 47 of X: `.gitignore`

This file is crucial for preventing sensitive data and unnecessary files from being committed to your version control system. It should be placed in the root directory.

```
# --- Python ---
# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# C extensions
*.so

# Distribution / packaging
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# PyInstaller
# Usually these files are created by pyinstaller, if you use your own tool, please add files to this list
*.manifest
*.spec

# Installer logs
pip-log.txt
pip-delete-this-directory.txt

# Unit test / coverage reports
htmlcov/
.tox/
.nox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
.hypothesis/
.pytest_cache/

# Environments
.env
.venv
env/
venv/
ENV/
env.bak
venv.bak

# Database files
*.db
*.sqlite3

# --- Node.js / React ---
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-temporary-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# TypeScript v1 declaration files
typings/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache/
.parcel-cache/

# Next.js build output
.next
out

# Nuxt.js build output
.nuxt
dist

# Gatsby files
.cache/
public

# Svelte files
.svelte-kit

# Docusaurus files
.docusaurus

# Vue files
.vuepress/dist

# Frontend build directory
build/
dist/

# Frontend environment files
frontend/.env
frontend/.env.local
frontend/.env.development.local
frontend/.env.test.local
frontend/.env.production.local


# --- OS / Editor ---
# macOS
.DS_Store
.AppleDouble
.LSOverride

# Thumbnails
._*

# Windows thumbnail cache
Thumbs.db

# VSCode
.vscode/

# JetBrains
.idea/
