import os
import json
import anthropic
from datetime import date, timedelta, datetime
import zoneinfo
from sqlalchemy.orm import Session
import models

def _get_sweden_today() -> date:
    """Returnerar dagens datum i Sverige (hanterar UTC vs CET/CEST)."""
    tz = zoneinfo.ZoneInfo("Europe/Stockholm")
    return datetime.now(tz).date()

def _get_sweden_weekday() -> str:
    """Returnerar veckodagsnamn på svenska baserat på svensk tid."""
    tz = zoneinfo.ZoneInfo("Europe/Stockholm")
    idx = datetime.now(tz).weekday()  # 0=Måndag, 6=Söndag
    return WEEKDAYS_SV[idx]

WEEKDAYS_SV = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"]

TOOLS = [
    {
        "name": "create_task",
        "description": "Skapar en uppgift för ett specifikt datum i databasen.",
        "input_schema": {
            "type": "object",
            "properties": {
                "date": {"type": "string", "description": "ISO-datum YYYY-MM-DD"},
                "title": {"type": "string"},
                "start": {"type": "string", "description": "Starttid HH:MM"},
                "end": {"type": "string", "description": "Sluttid HH:MM"},
                "period": {"type": "string", "description": "Visningsperiod t.ex. '09:00–10:00'"},
                "category": {"type": "string", "description": "morgon|jobb|lärande|träning|mat|reflektion|paus"},
                "subtasks": {"type": "array", "items": {"type": "string"}},
                "links": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {"label": {"type": "string"}, "url": {"type": "string"}},
                        "required": ["label", "url"]
                    }
                }
            },
            "required": ["date", "title", "category"]
        }
    },
    {
        "name": "get_schedule",
        "description": "Hämtar alla uppgifter för ett datum.",
        "input_schema": {
            "type": "object",
            "properties": {"date": {"type": "string", "description": "ISO-datum YYYY-MM-DD"}},
            "required": ["date"]
        }
    },
    {
        "name": "update_schedule",
        "description": "Ersätter hela schemat för ett datum med en ny lista uppgifter.",
        "input_schema": {
            "type": "object",
            "properties": {
                "date": {"type": "string"},
                "tasks": {"type": "array", "description": "Fullständig lista med tasks"}
            },
            "required": ["date", "tasks"]
        }
    },
    {
        "name": "delete_schedule",
        "description": "Tar bort alla uppgifter för ett datum.",
        "input_schema": {
            "type": "object",
            "properties": {"date": {"type": "string"}},
            "required": ["date"]
        }
    },
    {
        "name": "get_user_profile",
        "description": "Hämtar användarens fullständiga profil med mål, situation och preferenser.",
        "input_schema": {"type": "object", "properties": {}, "required": []}
    },
    {
        "name": "analyze_progress",
        "description": "Analyserar användarens framsteg senaste 7 dagarna.",
        "input_schema": {"type": "object", "properties": {}, "required": []}
    },
    {
        "name": "save_milestones",
        "description": "Sparar månads- eller kvartalsmilstolpar för långsiktig planering.",
        "input_schema": {
            "type": "object",
            "properties": {
                "milestones": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "month": {"type": "integer"},
                            "period": {"type": "string"},
                            "title": {"type": "string"},
                            "goals": {"type": "array", "items": {"type": "string"}},
                            "resources": {
                                "type": "array",
                                "items": {"type": "object", "properties": {"label": {"type": "string"}, "url": {"type": "string"}}}
                            }
                        },
                        "required": ["month", "period", "title", "goals"]
                    }
                }
            },
            "required": ["milestones"]
        }
    }
]

SYSTEM_PROMPT = """Du är Flow, en smart personlig AI-coach för svenska användare. Kortfattad, varm och direkt.

Dagens datum: {today_date} ({today_weekday})

ANVÄNDARPROFIL (redan insamlad - fråga ALDRIG om detta igen):
{profile}

ABSOLUT KRITISK REGEL:
Profilen ovan innehåller ALL information du behöver.
Fråga ALDRIG om vaknar, sömn, träning, jobb, skills, budget eller tidsram - det finns redan i profilen.
När användaren säger "Skapa mitt schema" eller liknande - läs profilen och skapa schemat DIREKT med create_task.

SCHEMA-SKAPANDE - GÖR DETTA DIREKT (SNABBT):
1. Använd update_schedule (INTE create_task) - det sätter ALLA uppgifter på en gång per dag
2. Kalla update_schedule för dag 1 ({today_date}) med alla 6 uppgifter i tasks-arrayen
3. Kalla update_schedule för dag 2 (imorgon) med alla 6 uppgifter
4. Fortsätt för dag 3-7 (totalt 7 anrop)
5. Kalla save_milestones med alla 6 milstolpar i ett enda anrop
6. Skriv BARA 1-2 meningar efteråt. Avsluta med exakt [Gå till schemat]

KRITISKT: Använd ALDRIG create_task när du skapar schemat - det är för långsamt.
Använd update_schedule med tasks=[{title,category,start,end,period,subtasks:[],links:[],done:false}, ...]

DAGLIGT SCHEMA - bygg baserat på profilen, MAX 6 uppgifter per dag:
- Morgonrutin: wake_time → wake_time+30min (kategori: morgon)
- Frukost: wake_time+30min → wake_time+1h (kategori: mat)
- Träning: om training != "Tränar inte" (kategori: träning)
- Deep Work: 2h lärande på skills (kategori: lärande)
- Lunch: 1h (kategori: mat)
- Kvällsreflektion: 20min innan sovtid (kategori: reflektion)

FÖR 7 UNIKA DAGAR:
Dag 1 ({today_date}): Deep Work = "Setup och grunder - installera verktyg"
Dag 2: Deep Work = "Fördjupning i [skill 1]"
Dag 3: Deep Work = "Bygg något konkret"
Dag 4: Deep Work = "[Skill 2] - nytt område"
Dag 5: Deep Work = "Projektdag - bygg ett riktigt projekt"
Dag 6: Deep Work = "Nätverkande - LinkedIn och communities"
Dag 7: Deep Work = "Veckoreflexion och planering"

Kalla save_milestones med 6 milstolpar i ETT anrop.

SMARTA FÖLJDFRÅGOR (bara om användaren tar upp något nytt):
- Nämner specifik tid → bekräfta och använd den
- Ber om justering → justera och uppdatera med update_schedule
- Ber om motivation → ge kort och kraftfull motivering

CHIP-REGLER:
- Format: [Alternativ] i slutet av frågan
- Max 2-3 meningar per svar
- Fråga bara om saker som INTE finns i profilen

RESURSLÄNKAR (välj relevanta):
No-Code: https://make.com och https://bubble.io
AI Content: https://claude.ai
Python: https://cs50.harvard.edu/python
Design: https://www.figma.com/resources/learn-design
Marknadsföring: https://learndigital.withgoogle.com/digitalgarage
Träning: https://www.youtube.com/@JeffNippard
Jobb: https://www.linkedin.com/jobs

ALLTID: Svenska, inga emojis, inga asterisker, varm ton."""


def _profile_to_str(profile: dict) -> str:
    if not profile:
        return "Ingen profil ännu."
    lines = []
    field_names = {
        "name": "Namn", "age": "Ålder", "situation": "Situation",
        "goals": "Mål", "wake_time": "Vaknar", "sleep_hours": "Sömn",
        "training": "Träning", "training_type": "Träningstyp",
        "training_duration": "Träningstid", "gym_distance": "Avstånd till gym",
        "job_type": "Jobb", "job_hours": "Jobbtimmar", "job_commute": "Pendling jobb",
        "skills": "Skills/Yrke", "learning_hours": "Lärande per dag",
        "budget": "Budget", "timeframe": "Tidsram", "education": "Utbildning",
        "experience": "Erfarenhet", "discipline": "Disciplin", "work_style": "Arbetsstil",
    }
    for k, v in profile.items():
        if v and k != "completed":
            label = field_names.get(k, k)
            lines.append(f"{label}: {v}")
    return "\n".join(lines) if lines else "Ingen profil ännu."


def _exec_create_task(db: Session, user_id: int, inp: dict) -> dict:
    task_date = inp["date"]
    start = inp.get("start", "")
    end = inp.get("end", "")
    period = inp.get("period") or (f"{start}–{end}" if start and end else "")
    new_task = {
        "title": inp["title"],
        "category": inp.get("category", "jobb"),
        "start": start,
        "end": end,
        "period": period,
        "subtasks": inp.get("subtasks", []),
        "links": inp.get("links", []),
        "done": False,
    }
    existing = db.query(models.Schedule).filter(
        models.Schedule.user_id == user_id,
        models.Schedule.date == task_date,
    ).first()
    if existing:
        tasks = list(existing.tasks or [])
        tasks.append(new_task)
        existing.tasks = tasks
    else:
        db.add(models.Schedule(user_id=user_id, date=task_date, timeframe="Idag", tasks=[new_task]))
    db.commit()
    return {"ok": True, "date": task_date, "title": new_task["title"]}


def _exec_get_schedule(db: Session, user_id: int, inp: dict) -> dict:
    s = db.query(models.Schedule).filter(
        models.Schedule.user_id == user_id,
        models.Schedule.date == inp["date"],
    ).first()
    return {"date": inp["date"], "tasks": s.tasks or [] if s else []}


def _exec_update_schedule(db: Session, user_id: int, inp: dict) -> dict:
    tasks = [dict(t, done=t.get("done", False)) for t in inp.get("tasks", [])]
    s = db.query(models.Schedule).filter(
        models.Schedule.user_id == user_id,
        models.Schedule.date == inp["date"],
    ).first()
    if s:
        s.tasks = tasks
    else:
        db.add(models.Schedule(user_id=user_id, date=inp["date"], timeframe="Idag", tasks=tasks))
    db.commit()
    return {"ok": True, "date": inp["date"], "count": len(tasks)}


def _exec_delete_schedule(db: Session, user_id: int, inp: dict) -> dict:
    s = db.query(models.Schedule).filter(
        models.Schedule.user_id == user_id,
        models.Schedule.date == inp["date"],
    ).first()
    if s:
        s.tasks = []
        db.commit()
    return {"ok": True, "date": inp["date"]}


def _exec_get_profile(db: Session, user_id: int) -> dict:
    p = db.query(models.Profile).filter(models.Profile.user_id == user_id).first()
    if not p:
        return {}
    result = {}
    for col in ["name", "age", "situation", "goals", "education", "experience",
                "budget", "time_per_day", "discipline", "work_style"]:
        val = getattr(p, col, None)
        if val:
            result[col] = val
    # Extra fields stored in profile
    for col in ["wake_time", "sleep_hours", "training", "training_type",
                "training_duration", "gym_distance", "job_type", "job_hours",
                "job_commute", "skills", "learning_hours", "timeframe"]:
        val = getattr(p, col, None)
        if val:
            result[col] = val
    return result


def _exec_analyze_progress(db: Session, user_id: int) -> dict:
    today = date.today()
    total_done = 0
    total = 0
    daily = []
    for i in range(7):
        d = (today - timedelta(days=i)).isoformat()
        s = db.query(models.Schedule).filter(
            models.Schedule.user_id == user_id,
            models.Schedule.date == d,
        ).first()
        if s and s.tasks:
            done = sum(1 for t in s.tasks if t.get("done"))
            total_done += done
            total += len(s.tasks)
            daily.append({"date": d, "done": done, "total": len(s.tasks)})
    pct = round(total_done / total * 100) if total > 0 else 0
    return {
        "summary": f"{total_done} av {total} uppgifter avklarade senaste 7 dagarna ({pct}%)",
        "completion_rate": pct,
        "daily": daily,
    }


def _exec_save_milestones(db: Session, user_id: int, inp: dict) -> dict:
    data = inp.get("milestones", [])
    m = db.query(models.Milestone).filter(models.Milestone.user_id == user_id).first()
    if m:
        m.data = data
    else:
        db.add(models.Milestone(user_id=user_id, data=data))
    db.commit()
    return {"ok": True, "count": len(data)}


def _dispatch(name: str, inp: dict, db: Session, user_id: int) -> dict:
    if name == "create_task":
        return _exec_create_task(db, user_id, inp)
    if name == "get_schedule":
        return _exec_get_schedule(db, user_id, inp)
    if name == "update_schedule":
        return _exec_update_schedule(db, user_id, inp)
    if name == "delete_schedule":
        return _exec_delete_schedule(db, user_id, inp)
    if name == "get_user_profile":
        return _exec_get_profile(db, user_id)
    if name == "analyze_progress":
        return _exec_analyze_progress(db, user_id)
    if name == "save_milestones":
        return _exec_save_milestones(db, user_id, inp)
    return {"error": f"Okänt verktyg: {name}"}


def run_agent(messages: list, user_id: int, db: Session) -> str:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    client = anthropic.Anthropic(api_key=api_key)

    today = _get_sweden_today()
    profile = _exec_get_profile(db, user_id)

    system = SYSTEM_PROMPT.format(
        today_date=today.isoformat(),
        today_weekday=_get_sweden_weekday(),
        profile=_profile_to_str(profile),
    )

    claude_messages = list(messages)

    for _ in range(25):
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            system=system,
            tools=TOOLS,
            messages=claude_messages,
        )

        if response.stop_reason == "end_turn":
            return "".join(b.text for b in response.content if hasattr(b, "text"))

        if response.stop_reason == "tool_use":
            claude_messages.append({"role": "assistant", "content": response.content})
            results = []
            for block in response.content:
                if block.type == "tool_use":
                    result = _dispatch(block.name, block.input, db, user_id)
                    results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": json.dumps(result, ensure_ascii=False),
                    })
            claude_messages.append({"role": "user", "content": results})
        else:
            break

    return "Förlåt, något gick fel. Försök igen."