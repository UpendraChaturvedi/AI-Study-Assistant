# ✨ AI Study Assistant — YouTube Learning Copilot

> Transform long YouTube video lectures into interactive study packs in seconds. Powered by **Google Gemini 3.6 Flash**, **React 18**, **Node.js**, and **MongoDB**.

---

## 💡 Why We Built This

Ever tried watching a 3-hour video lecture on *React.js*, *Neural Networks*, or *Computer Networks*, only to realize halfway through that you spent more time pausing the video to write notes than actually understanding the concepts?

**AI Study Assistant** was built to solve this exact problem. It acts as your personal 24/7 learning copilot directly inside YouTube. Instead of manually taking notes, you can select any video timestamp range (like `04:20 ➔ 09:15`), and let AI instantly generate structured study notes, executive summaries, self-assessment quizzes, active recall flashcards, and concept mind maps!

---

## 🚀 Key Features

### ⏱️ 1. Precision Timestamp Extraction
- **YouTube Floating Overlay:** Mark start (`⏱️ Start`) and end (`⏱️ End`) times directly on the YouTube video player with 1 click.
- **Manual Segment Picker:** Set exact minutes and seconds (`Min : Sec`) in the extension popup or full-screen dashboard.

### 📝 2. Rich Markdown Notes & Executive Summaries
- **Structured Formatting:** Notes render cleanly with styled section headers, bullet lists, highlighted bold key terms, and code snippet badges.
- **Executive Summaries:** Quick 3–5 sentence high-yield takeaways for rapid review before exams.

### 🔊 3. Audio / Voice Notes (Text-to-Speech Reader)
- **Listen On-the-Go:** 1-click **Listen**, **Pause**, **Resume**, and **Stop** controls powered by the Web Speech API.
- Listen to summaries or detailed notes while commuting or multi-tasking.

### 🌐 4. Hindi (हिंदी) & English Dual-Language Support
- **Output Language Selector:** Choose to generate all study materials in **English** or **Hindi (हिंदी)** (with English technical terms in parentheses).
- **1-Click Hindi Summary Toggle:** Convert any English summary into Hindi on the fly!

### ❓ 5. Interactive Self-Assessment Quizzes
- **Randomized Options:** Option choices (A, B, C, D) are shuffled dynamically so the correct answer is never predictably placed.
- **Instant Explanations:** Detailed explanations provided after every question.
- **MongoDB Score Tracking:** Accuracy scores and completed quizzes are automatically saved under your account.

### 🎴 6. 3D Active Recall Flashcards
- Digital Q&A flashcards designed for spaced repetition and rapid exam prep.

### 🌿 7. Concept Mind Maps
- Visual hierarchy nodes extracting core topics and relationships from the lecture.

### 📄 8. 1-Click Export Options
- **Save as PDF:** Formatted printable layout that opens Chrome's native PDF window.
- **Markdown (`.md`):** Export clean raw Markdown files.
- **Text (`.txt`):** Download plain text summaries.

### 📊 9. Student Analytics & Smart Revision
- **MongoDB Persistence:** All study packs, generated notes, and quiz histories are saved across sessions.
- **Smart AI Revision Recommendations:** Highlights topics where quiz accuracy fell below threshold and provides a 1-click **`Revise Now →`** button that auto-seeks the YouTube video to the exact revision timestamp!

### 🎨 10. Sleek & Flexible Interface
- **YouTube Floating Bar:** Injected directly into YouTube watch pages.
- **YouTube Injected Results Modal:** Opens a spacious glass modal drawer on YouTube with **Maximize (`🗖`)** and **Close (`✕`)** controls.
- **Chrome Extension Toolbar Popup:** Standard 420px dark violet glassmorphic window.
- **Desktop Full-Screen Dashboard:** Dedicated `max-w-6xl` desktop view for distraction-free studying.

---

## 🏗️ Tech Stack

| Layer | Technology Used |
| :--- | :--- |
| **Extension Standard** | Chrome Manifest V3 (Service Worker, Content Scripts) |
| **Frontend Framework** | React 18, Vite |
| **Styling & Icons** | Vanilla CSS Design System, TailwindCSS, Lucide Icons, Framer Motion |
| **Backend API** | Node.js, Express.js |
| **AI Model** | Google `@google/genai` (Gemini 3.6 Flash) |
| **Database** | MongoDB & Mongoose |

---

## 📁 Repository Structure

```text
AI-Study-Assistant/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB database connection
│   │   ├── controllers/     # API request handlers (generate, user, quiz)
│   │   ├── models/          # Mongoose schemas (User, StudySession, Quiz)
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Gemini AI service integration
│   │   ├── app.js           # Express app setup & middleware
│   │   └── server.js        # Server listener
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/          # Application icons & branding
│   │   ├── background/      # Extension service worker (background.js)
│   │   ├── components/      # React components (NotesViewer, QuizCard, FlashcardDeck, MindMap, AuthModal)
│   │   ├── content/         # Injected YouTube scripts (content.jsx & content.css)
│   │   ├── pages/           # Main tabs (GenerateTab, ResultsTab, DashboardTab)
│   │   ├── popup/           # Extension popup entry point (Popup.jsx)
│   │   └── services/        # API service layer
│   ├── manifest.json
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## ⚡ Quick Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)
- [Google Gemini API Key](https://aistudio.google.com/)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/AI-Study-Assistant.git
cd AI-Study-Assistant
```

---

### Step 2: Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-study-assistant
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the backend server:
```bash
npm start
```
*The server will run on `http://localhost:5000`.*

---

### Step 3: Frontend Setup & Build
```bash
cd ../frontend
npm install
npm run build
```
*This compiles the extension bundle into `frontend/dist/`.*

---

### Step 4: Load Extension in Google Chrome
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** in the top right corner.
3. Click **Load unpacked** in the top left corner.
4. Select the **`frontend/dist`** folder.
5. The **AI Study Assistant** extension icon will now appear in your toolbar!

---

## 📖 How to Use

1. **Open YouTube:** Go to any educational video on [YouTube](https://www.youtube.com).
2. **Mark Timestamp Segment:** 
   - Look at the bottom-right corner of your screen for the floating **AI Study** bar.
   - Click **`⏱️ Start`** at the beginning of the topic, and **`⏱️ End`** at the end.
3. **Generate Study Materials:** Click **`✨ Extract & Study`**.
4. **View & Interact:**
   - A glass modal will pop up right on YouTube with your formatted **Notes**, **Quiz**, **Flashcards**, and **Mind Map**.
   - Use the **`🗖 Maximize`** button to expand full-screen, or the **`✕ Close`** button when finished.
   - Use the extension popup icon in your toolbar anytime to view past sessions and track your analytics in the **Dashboard**!

---


Happy Studying! 🎓✨
