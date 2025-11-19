import cv2
import time
import math
import json
import os
from datetime import datetime, timedelta

import mediapipe as mp
import openai
import requests

# -----------------------------
# CONFIG
# -----------------------------

DB_URL = os.getenv("FIREBASE_DB_URL")  # e.g. https://your-project-id.firebaseio.com
FIREBASE_API_KEY = os.getenv("FIREBASE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

NO_FACE_TIMEOUT = 20 * 60      # 20 minutes (seconds)
EYES_CLOSED_TIMEOUT = 5 * 60   # 5 minutes (seconds)

# YOLO-related: we’ll try to import it safely
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except Exception as e:
    print(f"[YOLO] Failed to import ultralytics: {e}")
    YOLO_AVAILABLE = False

# Classes to treat as “energy drink” or “snack”
ENERGY_DRINK_CLASSES = {"bottle", "cup", "wine glass", "can"}
SNACK_CLASSES = {"apple", "banana", "orange", "cake", "donut", "sandwich", "hot dog", "pizza"}

yolo_model = None
if YOLO_AVAILABLE:
    try:
        yolo_model = YOLO("yolov8n.pt")
    except Exception as e:
        print(f"[YOLO] Failed to load YOLO model: {e}")
        YOLO_AVAILABLE = False


# -----------------------------
# FIREBASE HELPERS
# -----------------------------

def firebase_sign_in(email: str, password: str) -> dict | None:
    """
    Sign in a user with email/password using Firebase Auth REST API.
    Returns dict with idToken, localId, email on success, or None on failure.
    """
    if not FIREBASE_API_KEY:
        print("[FIREBASE] FIREBASE_API_KEY not set. Cannot sign in.")
        return None

    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}"
    payload = {
        "email": email,
        "password": password,
        "returnSecureToken": True
    }

    try:
        resp = requests.post(url, json=payload)
        if resp.status_code != 200:
            print(f"[FIREBASE] Sign-in failed: {resp.status_code} {resp.text}")
            return None
        data = resp.json()
        return {
            "idToken": data["idToken"],
            "localId": data["localId"],
            "email": data["email"]
        }
    except Exception as e:
        print(f"[FIREBASE] Error during sign-in: {e}")
        return None


def firebase_save_session(user: dict, session_data: dict):
    """
    Save session data under /users/{localId}/sessions in Realtime Database.
    """
    if not DB_URL:
        print("[FIREBASE] FIREBASE_DB_URL not set. Skipping save.")
        return

    local_id = user["localId"]
    id_token = user["idToken"]

    url = f"{DB_URL.rstrip('/')}/users/{local_id}/sessions.json?auth={id_token}"

    # include email in the session data explicitly
    data = dict(session_data)
    data["email"] = user["email"]

    try:
        resp = requests.post(url, json=data)
        if resp.status_code not in (200, 201):
            print(f"[FIREBASE] Failed to save session: {resp.status_code} {resp.text}")
        else:
            print("[FIREBASE] Session saved successfully.")
    except Exception as e:
        print(f"[FIREBASE] Error saving session: {e}")


def firebase_save_test(user: dict, test_data: dict):
    """
    Save test info under /users/{localId}/tests in Realtime Database.
    Returns Firebase-generated key or None.
    """
    if not DB_URL:
        return None

    local_id = user["localId"]
    id_token = user["idToken"]
    url = f"{DB_URL.rstrip('/')}/users/{local_id}/tests.json?auth={id_token}"

    data = dict(test_data)
    data["email"] = user["email"]

    try:
        resp = requests.post(url, json=data)
        if resp.status_code not in (200, 201):
            print(f"[FIREBASE] Failed to save test: {resp.status_code} {resp.text}")
            return None
        key = resp.json().get("name")
        print(f"[FIREBASE] Test saved with key: {key}")
        return key
    except Exception as e:
        print(f"[FIREBASE] Error saving test: {e}")
        return None


# -----------------------------
# MEDIAPIPE / EAR HELPERS
# -----------------------------

mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils

# Example landmark indices for LEFT eye using MediaPipe FaceMesh.
LEFT_EYE_IDX = [33, 160, 158, 133, 153, 144]  # [P1, P2, P3, P4, P5, P6]


def euclidean(p1, p2):
    return math.dist(p1, p2)


def compute_ear(landmarks, eye_indices, image_width, image_height):
    """
    landmarks: sequence of landmark objects (from MediaPipe)
    eye_indices: six indices [P1, P2, P3, P4, P5, P6]
    """
    pts = []
    for idx in eye_indices:
        lm = landmarks[idx]
        x = lm.x * image_width
        y = lm.y * image_height
        pts.append((x, y))

    p1, p2, p3, p4, p5, p6 = pts

    # Vertical distances
    v1 = euclidean(p2, p6)
    v2 = euclidean(p3, p5)

    # Horizontal distance
    h = euclidean(p1, p4)

    if h == 0:
        return None

    ear = (v1 + v2) / (2.0 * h)
    return ear


def calibrate_open_ear(cap, face_mesh, duration_sec=3):
    """
    Ask user to look at camera with eyes open. Collect EAR for a few seconds
    and compute baseline.
    """
    print("\nCalibration: Please look at the camera with eyes open for ~3 seconds...")
    ears = []
    start = time.time()

    while time.time() - start < duration_sec:
        ret, frame = cap.read()
        if not ret:
            break

        h, w, _ = frame.shape
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb)

        if results.multi_face_landmarks:
            face_landmarks = results.multi_face_landmarks[0].landmark
            ear = compute_ear(face_landmarks, LEFT_EYE_IDX, w, h)
            if ear is not None:
                ears.append(ear)

        cv2.putText(frame, "Calibrating... Keep eyes open", (20, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        cv2.imshow("Mind in Focus", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    if not ears:
        # Fallback default
        print("Calibration failed, using default EAR baseline 0.28")
        return 0.28

    baseline = sum(ears) / len(ears)
    print(f"Calibration done. Open-eye EAR baseline: {baseline:.3f}")
    return baseline


def compute_focus_score(ear, face_present, open_ear_baseline, closed_ratio=0.5):
    """
    Returns a focus score 0–100 based on EAR and face presence.
    Simple version:
      - No face: 0
      - EAR <= closed_threshold: 0
      - EAR >= open_baseline: 100
      - Linear scale in between
    """
    if not face_present or ear is None:
        return 0.0

    closed_threshold = open_ear_baseline * closed_ratio

    if ear <= closed_threshold:
        return 0.0
    if ear >= open_ear_baseline:
        return 100.0

    # Scale between closed_threshold and open_ear_baseline
    ratio = (ear - closed_threshold) / (open_ear_baseline - closed_threshold)
    ratio = max(0.0, min(1.0, ratio))
    return ratio * 100.0


# -----------------------------
# YOLO ENERGY DRINK & SNACK DETECTION
# -----------------------------

def detect_items(frame):
    """
    Run YOLO on the frame and return (drink_detected, snack_detected).
    If YOLO is unavailable or errors, returns (False, False).
    """
    if not YOLO_AVAILABLE or yolo_model is None:
        return False, False

    try:
        results = yolo_model(frame, verbose=False)[0]
        drink_detected = False
        snack_detected = False

        for box in results.boxes:
            cls_id = int(box.cls.item())
            cls_name = results.names[cls_id]
            conf = float(box.conf.item())
            if conf < 0.5:
                continue

            if cls_name in ENERGY_DRINK_CLASSES:
                drink_detected = True
            if cls_name in SNACK_CLASSES:
                snack_detected = True

        return drink_detected, snack_detected
    except Exception as e:
        # Just log and fall back to "no detections" so the app doesn't crash
        print(f"[YOLO] Error during detection: {e}")
        return False, False



def get_quick_fact_for_energy_drink(drink_count: int) -> str | None:
    """
    Use OpenAI to get a short, student-friendly fact about
    energy drinks & studying. Returns None if API key missing or error.
    """
    if not client:
        return None

    try:
        resp = client.chat.completions.create(
            model="gpt-4.1-mini",  # or "gpt-4o-mini" if your key allows
            messages=[
                {
                    "role": "user",
                    "content": (
                        "Give me one short, student-friendly fact about how energy drinks "
                        "affect studying, focus, or sleep. 1-2 sentences, no scare tactics, "
                        "just helpful insight. This is fact number "
                        f"{drink_count} in a series, avoid repeating earlier tips."
                    ),
                }
            ],
            max_tokens=60,
            temperature=0.7,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        print(f"[Quick Fact Error] {e}")
        return None


# -----------------------------
# SESSION LOOP
# -----------------------------

def run_study_session(user: dict, session_meta: dict):
    """
    user: dict from firebase_sign_in (idToken, localId, email)
    session_meta: dict with reason, category, planned_minutes, test_datetime, etc.
    """
    planned_minutes = session_meta["planned_minutes"]
    test_datetime = session_meta.get("test_datetime")

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    with mp_face_mesh.FaceMesh(
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as face_mesh:

        # Calibrate open-eye EAR
        open_ear_baseline = calibrate_open_ear(cap, face_mesh)
        closed_threshold = open_ear_baseline * 0.5

        session_active = True
        session_start = time.time()
        last_face_seen_time = session_start
        eyes_closed_start_time = None
        focus_scores = []

        # YOLO & energy drink/snack tracking
        energy_drinks = 0
        snacks = 0
        energy_drink_present_prev = False
        snack_present_prev = False
        last_quick_fact = None

        # Study duration notification
        planned_end_time = session_start + planned_minutes * 60
        time_up_prompt_cooldown = False

        # Test reminders
        reminder_1_shown = False
        reminder_2_shown = False
        if test_datetime is not None:
            rem1_ts = test_datetime.timestamp() - 3600     # 1 hour before
            rem2_ts = test_datetime.timestamp() - 600      # 10 minutes before
        else:
            rem1_ts = rem2_ts = None

        frame_count = 0

        print("\nSession started. Press 'q' to end manually.")
        print("If no face for 20 min OR eyes closed 5 min, session auto-ends (sleep detected).\n")

        while session_active:
            now = time.time()
            ret, frame = cap.read()
            if not ret:
                print("Error reading frame. Ending session.")
                break

            h, w, _ = frame.shape
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(rgb)

            face_present = False
            ear = None

            if results.multi_face_landmarks:
                face_present = True
                last_face_seen_time = now
                face_landmarks = results.multi_face_landmarks[0].landmark

                ear = compute_ear(face_landmarks, LEFT_EYE_IDX, w, h)

                # Draw landmarks (optional)
                mp_drawing.draw_landmarks(
                    frame,
                    results.multi_face_landmarks[0],
                    mp_face_mesh.FACEMESH_TESSELATION,
                    landmark_drawing_spec=None,
                    connection_drawing_spec=mp_drawing.DrawingSpec(
                        thickness=1, circle_radius=1)
                )

            # Sleep condition: no face
            if not face_present:
                if now - last_face_seen_time > NO_FACE_TIMEOUT:
                    print("[NOTIFY] No face in view for 20+ minutes. Assuming sleep, ending session.")
                    session_active = False
            else:
                # Eyes closed logic
                if ear is not None and ear < closed_threshold:
                    if eyes_closed_start_time is None:
                        eyes_closed_start_time = now
                    else:
                        if now - eyes_closed_start_time > EYES_CLOSED_TIMEOUT:
                            print("[NOTIFY] Eyes closed for 5+ minutes. Assuming sleep, ending session.")
                            session_active = False
                else:
                    eyes_closed_start_time = None

            # Focus score
            focus_score = compute_focus_score(ear, face_present, open_ear_baseline)
            focus_scores.append(focus_score)

            # -------------------------
            # Study time notification
            # -------------------------
            if now >= planned_end_time and not time_up_prompt_cooldown:
                print("\n[NOTIFY] ⏰ Your planned study time is up!")
                print(f"You planned {planned_minutes} minutes and have reached that.")
                choice = input("Type 'e' to extend, 'x' to end session, or Enter to keep going silently: ").strip().lower()
                if choice == "e":
                    while True:
                        extra_str = input("How many extra minutes would you like to add? ").strip()
                        try:
                            extra_min = int(extra_str)
                            if extra_min <= 0:
                                raise ValueError
                            break
                        except ValueError:
                            print("Please enter a positive integer.")
                    planned_minutes += extra_min
                    planned_end_time = now + extra_min * 60
                    print(f"[NOTIFY] ✅ Extended session by {extra_min} minutes.")
                elif choice == "x":
                    print("[NOTIFY] Ending session at your request.")
                    session_active = False
                time_up_prompt_cooldown = True
            elif now < planned_end_time:
                time_up_prompt_cooldown = False

            # -------------------------
            # Test reminders
            # -------------------------
            if test_datetime is not None:
                if rem1_ts and now >= rem1_ts and not reminder_1_shown:
                    print("\n[NOTIFY] 📅 Reminder: Your test is in about 1 hour.")
                    reminder_1_shown = True
                if rem2_ts and now >= rem2_ts and not reminder_2_shown:
                    print("\n[NOTIFY] 📅 Reminder: Your test is in about 10 minutes.")
                    reminder_2_shown = True

            # -------------------------
            # YOLO energy drink & snack detection (every N frames)
            # -------------------------
            frame_count += 1
            if frame_count % 15 == 0:
                drink_detected, snack_detected = detect_items(frame)

                if drink_detected and not energy_drink_present_prev:
                    energy_drinks += 1
                    print(f"\n[NOTIFY] 🥤 Detected an energy drink (count = {energy_drinks}).")
                    fact = get_quick_fact_for_energy_drink(energy_drinks)
                    if fact:
                        last_quick_fact = fact
                        print(f"[NOTIFY] Quick fact: {fact}")

                if snack_detected and not snack_present_prev:
                    snacks += 1
                    print(f"\n[NOTIFY] 🍎 Detected a snack (count = {snacks}).")

                energy_drink_present_prev = drink_detected
                snack_present_prev = snack_detected

            # Overlay info on frame
            ear_display = ear if ear is not None else 0.0
            status_text = (
                f"Face: {'Yes' if face_present else 'No'} | "
                f"EAR: {ear_display:.3f} | "
                f"Focus: {focus_score:.1f}"
            )
            cv2.putText(
                frame,
                status_text,
                (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 255, 0),
                2
            )

            elapsed_min = (now - session_start) / 60.0
            cv2.putText(
                frame,
                f"Session time: {elapsed_min:.1f} min",
                (10, 60),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 255, 0),
                2
            )

            if energy_drinks > 0:
                cv2.putText(
                    frame,
                    f"Energy drinks: {energy_drinks}",
                    (10, 90),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 200, 255),
                    2
                )

            if snacks > 0:
                cv2.putText(
                    frame,
                    f"Snacks: {snacks}",
                    (10, 120),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 150, 255),
                    2
                )

            if last_quick_fact:
                fact_text = last_quick_fact
                if len(fact_text) > 80:
                    fact_text = fact_text[:77] + "..."
                cv2.putText(
                    frame,
                    f"Tip: {fact_text}",
                    (10, 150),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (255, 255, 255),
                    2
                )

            cv2.imshow("Mind in Focus - Session", frame)
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                print("[NOTIFY] Manual end requested. Ending session.")
                session_active = False

        cap.release()
        cv2.destroyAllWindows()

    session_end = time.time()
    avg_focus = sum(focus_scores) / len(focus_scores) if focus_scores else 0.0
    actual_minutes = (session_end - session_start) / 60.0

    # -------------------------
    # End-of-session summary (terminal)
    # -------------------------
    print("\n================ SESSION SUMMARY ================")
    print(f"User:            {user['email']}")
    print(f"Reason:          {session_meta['reason']}")
    print(f"Category:        {session_meta['category']}")
    print(f"Duration:        {actual_minutes:.1f} minutes")
    print(f"Average focus:   {avg_focus:.1f}/100")
    print(f"Energy drinks:   {energy_drinks}")
    print(f"Snacks:          {snacks}")
    print(f"Prior knowledge: {session_meta['prior_knowledge']}/10")
    print(f"Interest:        {session_meta['interest']}/10")
    if last_quick_fact:
        print("\nLast quick fact shown:")
        print(f"  {last_quick_fact}")
    print("=================================================\n")

    # Save to Firebase
    session_payload = {
        "reason": session_meta["reason"],
        "category": session_meta["category"],
        "planned_minutes": session_meta["planned_minutes"],
        "actual_minutes": actual_minutes,
        "avg_focus_score": avg_focus,
        "energy_drinks": energy_drinks,
        "snacks": snacks,
        "prior_knowledge": session_meta["prior_knowledge"],
        "interest": session_meta["interest"],
        "start_time": datetime.fromtimestamp(session_start).isoformat(),
        "end_time": datetime.fromtimestamp(session_end).isoformat(),
        "test_datetime": test_datetime.isoformat() if test_datetime else None,
        "created_at": datetime.now().isoformat(),
    }
    firebase_save_session(user, session_payload)

    # Also print a JSON summary for frontend integration
    session_stats = {
        "duration": actual_minutes,
        "avgFocus": avg_focus,
        "energyDrinks": energy_drinks,
        "snacks": snacks,
    }
    print("SESSION_STATS:", json.dumps(session_stats))


# -----------------------------
# CHATBOT-LIKE INTAKE (TERMINAL)
# -----------------------------

def chatbot_intake(user_email: str):
    print(f"\n👋 Welcome to Mind in Focus, {user_email}")
    print("What are you working on today?")
    print("1) Test\n2) Homework\n3) Project\n4) Reading\n5) Other")

    while True:
        choice = input("Choose an option (1-5): ").strip()
        if choice in {"1", "2", "3", "4", "5"}:
            break
        print("Please enter a number between 1 and 5.")

    study_type_map = {
        "1": "Test",
        "2": "Homework",
        "3": "Project",
        "4": "Reading",
        "5": "Other"
    }
    category = study_type_map[choice]

    test_dt = None
    reason = ""

    if category == "Test":
        test_title = input("What test is this for? (e.g., 'CS midterm'): ").strip() or "Unnamed Test"
        print("When is this test? (example: 2025-11-20 14:00)")
        while True:
            test_dt_str = input("Enter test date & time [YYYY-MM-DD HH:MM]: ").strip()
            try:
                test_dt = datetime.strptime(test_dt_str, "%Y-%m-%d %H:%M")
                break
            except ValueError:
                print("Invalid format. Please use YYYY-MM-DD HH:MM.")
        reason = f"Study for test: {test_title}"

        # Just print reminders conceptually
        rem1 = test_dt - timedelta(hours=1)
        rem2 = test_dt - timedelta(minutes=10)
        print("\nI will remember these reminder times (in this session):")
        print(f" - 1 hour before:      {rem1}")
        print(f" - 10 minutes before:  {rem2}")
    else:
        reason = input("Briefly describe what you're working on: ").strip()
        if not reason:
            reason = category

    while True:
        planned_str = input("How many minutes do you plan to study this session? (e.g., 25, 45, 60): ").strip()
        try:
            planned_minutes = int(planned_str)
            if planned_minutes <= 0:
                raise ValueError
            break
        except ValueError:
            print("Please enter a positive integer number of minutes.")

    # Prior knowledge (1–10)
    while True:
        pk_str = input("On a scale of 1-10, what's your current knowledge level on this topic? ").strip()
        try:
            prior_knowledge = int(pk_str)
            if 1 <= prior_knowledge <= 10:
                break
            else:
                raise ValueError
        except ValueError:
            print("Please enter an integer from 1 to 10.")

    # Interest (1–10)
    while True:
        interest_str = input("On a scale of 1-10, how interested are you in this subject? ").strip()
        try:
            interest = int(interest_str)
            if 1 <= interest <= 10:
                break
            else:
                raise ValueError
        except ValueError:
            print("Please enter an integer from 1 to 10.")

    print("\nSummary:")
    print(f"- Category:        {category}")
    print(f"- Reason:          {reason}")
    print(f"- Planned time:    {planned_minutes} minutes")
    print(f"- Prior knowledge: {prior_knowledge}/10")
    print(f"- Interest:        {interest}/10")
    confirm = input("Start this session now? (y/n): ").strip().lower()
    if confirm != "y":
        print("Okay, not starting a session.")
        return None

    return {
        "reason": reason,
        "category": category,
        "planned_minutes": planned_minutes,
        "test_datetime": test_dt,
        "prior_knowledge": prior_knowledge,
        "interest": interest
    }


# -----------------------------
# MAIN
# -----------------------------

def main():
    # 1) User login
    print("=== Mind in Focus Login ===")
    email = input("Email: ").strip()
    password = input("Password: ").strip()  # for real app, hide input

    user = firebase_sign_in(email, password)
    if not user:
        print("Login failed. Exiting.")
        return

    # 2) Session setup via chatbot
    intake = chatbot_intake(user["email"])
    if intake is None:
        return

    # optionally save test metadata to Firebase
    if intake["category"] == "Test" and intake["test_datetime"] is not None:
        firebase_save_test(
            user,
            {
                "title": intake["reason"],
                "test_datetime": intake["test_datetime"].isoformat(),
                "created_at": datetime.now().isoformat(),
            }
        )

    print("\nSession starting...")
    run_study_session(user, intake)


if __name__ == "__main__":
    main()
