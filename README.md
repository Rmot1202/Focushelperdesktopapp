# Focus Helper Desktop App

Focus Helper is a desktop-style study companion that helps students plan sessions, track how they’re doing, and get small nudges toward better study habits.

This repository contains the **front-end UI** (exported from Figma) plus **Python prototypes** for future ML features like study-habit recommendations and quiz generation.

> **Design source:**  
> https://www.figma.com/design/VLHzO7kpkiCCN5WXJJ6rqb/Focus-Helper-Desktop-App

---

## ✨ Features (Concept & Current State)

- 🖥️ **Desktop-style dashboard UI**
  - Shows current study session and upcoming work (tests, homework, projects).
  - Layout designed for focus: main session area + side panels for tips and info.

- ⏱️ **Study session setup (planned / WIP)**
  - Choose what you’re working on (test, homework, project, reading, other).
  - Specify exam date/time and session duration.
  - Track knowledge level and interest before/after studying.

- 🧠 **Study habit intelligence (Python prototypes)**
  - **SVM model** to classify session outcomes into **Success** vs **Failure**  
    using features like:
    - Time spent on the subject  
    - Attitude / motivation  
    - Existing skills / prior knowledge
  - **Logistic regression (planned)** for additional analytics and probability-style predictions.

- 🔔 **Smart notification ideas (planned)**
  - Ask quick, random questions about the topic during / between sessions.
  - Comment on snacks / energy drinks (e.g., “Is this actually helping you focus?”).
  - Suggest **break timing** (e.g., Pomodoro-style micro-breaks).

> At the moment, the UI is the main working piece. The ML models and notification logic live in Python scripts and are meant to be wired into the UI in future iterations.

---

## 🧰 Tech Stack

- **Front-End**
  - [TypeScript](https://www.typescriptlang.org/)
  - [Vite](https://vitejs.dev/) for dev server and bundling
  - HTML & CSS for layout and styling

- **Prototyping / Data Science**
  - **Python** scripts in `/python`  
    (e.g., for SVM, logistic regression, and quiz / study-habit experiments)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Rmot1202/Focushelperdesktopapp.git
cd Focushelperdesktopapp
````

### 2. Install dependencies

```bash
npm install
# or
yarn
```

### 3. Run the development server

```bash
npm run dev
# or
yarn dev
```

Vite will print a local URL (commonly `http://localhost:5173`).
Open that in your browser to view the Focus Helper desktop UI.

---

## 📂 Project Structure

> High-level overview – exact files may evolve over time.

```text
Focushelperdesktopapp/
├─ src/              # TypeScript + CSS source for the UI
├─ python/           # Python scripts for ML/analytics prototypes
├─ pthon/            # (Legacy / scratch Python folder, may be cleaned up later)
├─ index.html        # Root HTML; Vite mounts the app here
├─ package.json      # NPM scripts and dependencies
├─ vite.config.ts    # Vite configuration
└─ README.md         # Project documentation
```

### `src/`

* Components and layout for the Focus Helper interface.
* Styling for dashboard, panels, and session views.

### `python/`

* Prototype scripts for:

  * SVM classifier for study session **success vs failure**.
  * Future logistic regression experiments.
  * Potential quiz generation / study-habit logic.

> These scripts are currently **offline helpers** and may not yet be fully integrated into the frontend.

---

## 🧪 NPM Scripts

Check `package.json` for the full list; common ones include:

```bash
# Start dev server in watch mode
npm run dev

# Build for production
npm run build

# Preview the production build locally
npm run preview
```

---

## 🛣️ Roadmap

Planned / in-progress improvements:

* **UI / UX**

  * Session timeline and history view.
  * Better visual feedback on knowledge growth and interest over time.

* **ML / Analytics**

  * Finish and tune **SVM** and **logistic regression** models using real session data.
  * Surface model suggestions directly in the UI (“Try shorter sessions”, “Study earlier in the day”, etc.).

* **Notification System**

  * Background prompts with:

    * Short concept questions on the current subject.
    * Tips related to user’s snacks / energy drinks and their impact on focus.
    * Gentle break reminders and stretch prompts.

* **Persistence & Sync (stretch goal)**

  * Connect to a backend (e.g., Firebase) to store:

    * User sessions
    * Predictions & outcomes
    * Customized habit tips

---

## 🤝 Contributing

1. Fork this repository.
2. Create a feature branch:
   `git checkout -b feature/my-feature`
3. Commit your changes:
   `git commit -m "Add my feature"`
4. Push to your branch:
   `git push origin feature/my-feature`
5. Open a Pull Request.

Suggestions, issues, and ideas are welcome!

---

## 📄 License

A formal license hasn’t been added yet.
Until one is specified, treat this project as **proprietary / educational use only**.


