# **Focus Helper Desktop Application**

**Focus Helper** is an intelligent study-assistant application consisting of:

* A **front-end desktop UI** designed in Figma
* A **Python backend prototype (`mind_in_focus.py`)** that proves all features work
* Planned integrations with **Firebase**, **OpenAI**, **YOLO**, and the **Gamma Slide Generation API**

The backend currently runs standalone and outputs all the data needed for the UI to visualize live focus tracking, session statistics, quizzes, recommendations, and slide-generation results.

When connected, the UI will render these outputs into the finished visual experience shown in the Figma design.

---

# 🎨 **Front-End Overview (Figma → Desktop App)**

Figma design link:
**[https://www.figma.com/make/VLHzO7kpkiCCN5WXJJ6rqb/Focus-Helper-Desktop-App](https://www.figma.com/make/VLHzO7kpkiCCN5WXJJ6rqb/Focus-Helper-Desktop-App)**

The front-end includes:

### ✅ **Session Setup UI**

* Task type (Test / Homework / Project / Reading / Other)
* Test date/time input
* Session duration selector
* Prior knowledge (1–10)
* Interest level (1–10)
* Lofi music toggle

### ✅ **Live Session Dashboard**

* Camera feed panel
* Real-time focus meter
* Eye openness / EAR indicator
* Session timer
* Alerts when eyes closed too long
* “You may be asleep” notifications
* Energy drink + snack counters
* Quick “study facts” popup

### ✅ **Session Analytics**

* Avg. focus score
* Total minutes studied
* List of detected behaviors
* Quick fact summary
* Charts and graphs (front-end generated)

### ✅ **Quiz Review Panel**

* Upload PDF or TXT notes
* Enter free-form text
* Multiple-choice quiz
* Review hints
* Score summary
* “Study again?” suggestions

### ✅ **Slide Generator UI**

Uses **Gamma Generate API** to create:

* Study review decks
* PDF or PPTX exports
* Themed presentations

(All backend-supported and front-end ready.)

---

# 🧠 **Backend Overview (mind_in_focus.py)**

The Python backend serves as the **proof-of-concept engine**, fully implementing all smart features the UI depends on.

### Includes:

### 🔍 **1. Real-time Focus Tracking**

* Uses **OpenCV** + **MediaPipe FaceMesh**
* Computes **EAR (Eye Aspect Ratio)**
* Detects:

  * Closed eyes
  * No face detected
  * Sleep risk
* Generates **continuous focus score (0–100)**

### 🥤 **2. YOLOv8 Object Detection**

Detects:

* Energy drinks
* Snacks

Triggers:

* Counters
* Quick facts

YOLO classes used:

* Drinks: bottle, cup, can
* Snacks: apple, sandwich, pizza, etc.

### 💬 **3. OpenAI Integration**

Two key components:

1. **Energy drink study tips** (1–2 sentences)
2. **Post-session multiple-choice quiz generator**

Model used:

* `gpt-4.1-mini`

### 📄 **4. PDF/Text Input Processing**

* `PyPDF2` to extract study material
* TXT reader
* Provides content for quiz and slide generation

### 🔥 **5. Firebase Integration**

REST-based (via `requests`):

* Login (email/password)
* Save sessions
* Save test metadata

### 🎵 **6. Lofi Music Mode**

Opens YouTube stream via:

* `webbrowser.open()`

### 📈 **7. Session Summary Engine**

Generates:

* Avg focus
* Total minutes
* Sleep events
* Energy drink count
* Snacks
* JSON stats for front-end

---

# 📦 **Tech Stack**

## **Front-End**

| Component                     | Purpose                            |
| ----------------------------- | ---------------------------------- |
| **TypeScript**                | UI logic & state handling          |
| **Vite**                      | Build + dev environment            |
| **HTML/CSS**                  | UI layout                          |
| (Planned) **React**           | Dynamic component rendering        |
| (Planned) **Firebase JS SDK** | Auth + data sync                   |
| (Planned) **Axios**           | API communication to Python server |

---

## **Back-End**

| Library                                      | Purpose                            |
| -------------------------------------------- | ---------------------------------- |
| **OpenCV (cv2)**                             | Webcam capture & overlays          |
| **MediaPipe**                                | Face landmarks + EAR               |
| **Ultralytics YOLOv8**                       | Snack / drink detection            |
| **OpenAI SDK**                               | Quizzes + study tips               |
| **Requests**                                 | Firebase + Gamma API communication |
| **PyPDF2**                                   | PDF → text                         |
| **textwrap, json, datetime, math, os, time** | System utilities                   |
| **webbrowser**                               | Music launcher                     |

---

# 📊 **Data Flow & Architecture**

```
Front-End (Figma UI)
│
│  User input → Start session
▼
Python Backend (mind_in_focus.py)
│  - Focus detection
│  - YOLO labeling
│  - OpenAI quiz + tips
│  - Session stats
│  - Firebase logging
│  - Gamma deck creation (planned)
▼
Outputs JSON → Rendered by Front-End
```

---

# 📽️ **Slide Generator Using Gamma API**

Gamma API endpoint:
`POST https://public-api.gamma.app/v1.0/generations`

We use:

* `inputText` → Summary + missed quiz topics
* `textMode: "generate"`
* `format: "presentation"`
* `exportAs: pdf` or `pptx`

The backend will:

1. Build an outline from the quiz results
2. Send to Gamma
3. Await completion
4. Return URL + export links to the UI

No YAML is used.
Gamma uses **JSON only**.

---

# 📅 **Planned Features**

### 🔧 Architecture

* Local API server to connect Python backend → TS front-end
* Firebase sync for all analytics
* Real-time charts generated inside UI

### 📈 ML Extensions

* SVM “Success vs Failure” predictor
* Logistic regression focus-drop predictor
* Personalized study habit recommendations

### 🎓 User Experience

* Daily study habit dashboard
* Slide generator for every session
* Automatic topic recommendation
* Notification scheduling

---

# 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/Rmot1202/Focushelperdesktopapp.git
cd Focushelperdesktopapp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Front-End

```bash
npm run dev
```

### 4. Run Backend (Prototype)

Use the Python script located separately:

```bash
python mind_in_focus.py
```

(The backend is not yet connected to the front-end.)

---

# 🤝 Contributing

1. Fork repository
2. Create new branch (`feature/myfeature`)
3. Commit changes
4. Submit pull request

All contributions are welcome!

---

# 📄 License

Pending — currently for educational & developmental use only.

