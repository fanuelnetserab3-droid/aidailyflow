import os
import json
import anthropic
from datetime import date, timedelta, datetime
import zoneinfo
from sqlalchemy.orm import Session
import models

def _get_sweden_today() -> date:
    tz = zoneinfo.ZoneInfo("Europe/Stockholm")
    return datetime.now(tz).date()

def _get_sweden_weekday() -> str:
    tz = zoneinfo.ZoneInfo("Europe/Stockholm")
    idx = datetime.now(tz).weekday()
    return WEEKDAYS_SV[idx]

WEEKDAYS_SV = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"]

TOOLS = [
    {
        "name": "update_week_schedule",
        "description": "Skapar schema for ALLA 7 dagar pa en gang. Anvand ALLTID vid veckoschemaskapande.",
        "input_schema": {
            "type": "object",
            "properties": {
                "days": {
                    "type": "array",
                    "description": "Lista med 7 dagar",
                    "items": {
                        "type": "object",
                        "properties": {
                            "date": {"type": "string", "description": "ISO-datum YYYY-MM-DD"},
                            "tasks": {
                                "type": "array",
                                "description": "Max 6 uppgifter",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "title": {"type": "string"},
                                        "category": {"type": "string", "description": "morgon|mat|traning|larande|jobb|reflektion|paus"},
                                        "start": {"type": "string", "description": "HH:MM"},
                                        "end": {"type": "string", "description": "HH:MM"},
                                        "period": {"type": "string"},
                                        "subtasks": {"type": "array", "items": {"type": "string"}},
                                        "done": {"type": "boolean"}
                                    },
                                    "required": ["title", "category"]
                                }
                            }
                        },
                        "required": ["date", "tasks"]
                    }
                }
            },
            "required": ["days"]
        }
    },
    {
        "name": "update_schedule",
        "description": "Ersatter schemat for ETT datum. Anvand vid justeringar.",
        "input_schema": {
            "type": "object",
            "properties": {
                "date": {"type": "string"},
                "tasks": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string"},
                            "category": {"type": "string"},
                            "start": {"type": "string"},
                            "end": {"type": "string"},
                            "period": {"type": "string"},
                            "subtasks": {"type": "array", "items": {"type": "string"}},
                            "done": {"type": "boolean"}
                        },
                        "required": ["title", "category"]
                    }
                }
            },
            "required": ["date", "tasks"]
        }
    },
    {
        "name": "get_schedule",
        "description": "Hamtar uppgifter for ett datum.",
        "input_schema": {
            "type": "object",
            "properties": {"date": {"type": "string"}},
            "required": ["date"]
        }
    },
    {
        "name": "save_milestones",
        "description": "Sparar milstolpar for langsiktig planering.",
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
                            "goals": {"type": "array", "items": {"type": "string"}}
                        },
                        "required": ["month", "period", "title", "goals"]
                    }
                }
            },
            "required": ["milestones"]
        }
    },
    {
        "name": "analyze_progress",
        "description": "Analyserar framsteg senaste 7 dagarna.",
        "input_schema": {"type": "object", "properties": {}, "required": []}
    }
]

SYSTEM_PROMPT = """Du ar Flow, en smart personlig AI-coach. Kortfattad, varm, direkt. Svarar alltid pa svenska.

Dagens datum: {today_date} ({today_weekday})

ANVÄNDARPROFIL:
{profile}

ABSOLUTA REGLER:
- Kalla ALDRIG get_user_profile - profilen finns redan ovan
- Vid schemaskapande: kalla update_week_schedule + save_milestones i SAMMA svar
- Schemat BORJAR fran idag ({today_date}) - dag 1 ar IDAG inte imorgon
- Max 2 meningar text efter verktygsanropen
- ANVAND EXAKT de timmar anvandaren valt - aldrig mer, aldrig mindre

TIDREGLER (KRITISKT - felaktiga tider ar ett fel):
- Deep Work / Larande: EXAKT {learning_h} timmar (anvandaren valde detta - respektera det)
- Traning: EXAKT {training_h} timmar per pass
- start och end maste reflektera ratt antal timmar, t.ex. 4h larande = start 09:00 end 13:00

SCHEMA-FORMAT (update_week_schedule):
Varje dag ska ha 6 uppgifter som OBJEKT med title, category, start, end, period:
1. Morgonrutin - category: morgon, start: {wake}, end: {wake_30}
2. Frukost - category: mat, start: {wake_30}, end: {wake_60}
3. Traning - category: traning, EXAKT {training_h} timmar
4. Deep Work - category: larande, EXAKT {learning_h} timmar
5. Lunch - category: mat, 1 timme
6. Kvallsreflektion - category: reflektion, 20 min

Exempel task-objekt: {{"title": "Morgonrutin", "category": "morgon", "start": "07:00", "end": "07:30", "period": "07:00-07:30", "subtasks": [], "done": false}}

SKICKA ALDRIG tasks som strangar - alltid som objekt med title och category."""


def _profile_to_str(profile: dict) -> str:
    if not profile:
        return "Ingen profil annu."
    lines = []
    field_names = {
        "name": "Namn", "age": "Alder", "situation": "Situation",
        "goals": "Mal", "wake_time": "Vaknar", "sleep_hours": "Somn",
        "training": "Traning", "training_type": "Traningstyp",
        "training_duration": "Traningstid", "gym_distance": "Avstand",
        "job_type": "Jobb", "job_hours": "Jobbtimmar", "job_commute": "Pendling",
        "skills": "Skills", "learning_hours": "Larande/dag",
        "budget": "Budget", "timeframe": "Tidsram", "education": "Utbildning",
        "experience": "Erfarenhet", "discipline": "Disciplin", "work_style": "Stil",
    }
    for k, v in profile.items():
        if v and k != "completed":
            label = field_names.get(k, k)
            lines.append(f"{label}: {v}")
    return "\n".join(lines) if lines else "Ingen profil annu."


def _normalize_task(t) -> dict:
    if isinstance(t, str):
        return {"title": t, "category": "jobb", "start": "", "end": "", "period": "", "subtasks": [], "done": False}
    if isinstance(t, dict):
        start = t.get("start", "")
        end = t.get("end", "")
        period = t.get("period", f"{start}-{end}".strip("-"))
        return {
            "title": t.get("title", "Uppgift"),
            "category": t.get("category", "jobb"),
            "start": start,
            "end": end,
            "period": period,
            "subtasks": t.get("subtasks", []),
            "links": t.get("links", []),
            "done": t.get("done", False),
        }
    return {"title": str(t), "category": "jobb", "start": "", "end": "", "period": "", "subtasks": [], "done": False}


def _exec_update_week_schedule(db: Session, user_id: int, inp: dict) -> dict:
    days = inp.get("days", [])
    saved = 0
    for day in days:
        day_date = day.get("date")
        if not day_date:
            continue
        tasks = [_normalize_task(t) for t in day.get("tasks", [])]
        s = db.query(models.Schedule).filter(
            models.Schedule.user_id == user_id,
            models.Schedule.date == day_date,
        ).first()
        if s:
            s.tasks = tasks
        else:
            db.add(models.Schedule(user_id=user_id, date=day_date, timeframe="Idag", tasks=tasks))
        saved += 1
    db.commit()
    return {"ok": True, "days_saved": saved}


def _exec_update_schedule(db: Session, user_id: int, inp: dict) -> dict:
    tasks = [_normalize_task(t) for t in inp.get("tasks", [])]
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


def _exec_get_schedule(db: Session, user_id: int, inp: dict) -> dict:
    s = db.query(models.Schedule).filter(
        models.Schedule.user_id == user_id,
        models.Schedule.date == inp["date"],
    ).first()
    return {"date": inp["date"], "tasks": s.tasks or [] if s else []}


def _exec_get_profile(db: Session, user_id: int) -> dict:
    p = db.query(models.Profile).filter(models.Profile.user_id == user_id).first()
    if not p:
        return {}
    # Start with all raw fields (wake_time, learning_hours, training_type, etc.)
    result = dict(p.raw or {})
    # Override/supplement with direct DB columns
    for col in ["name", "age", "situation", "goals", "education", "experience",
                "budget", "time_per_day", "discipline", "work_style"]:
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
    return {"summary": f"{total_done} av {total} uppgifter ({pct}%)", "completion_rate": pct, "daily": daily}


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
    if name == "update_week_schedule":
        return _exec_update_week_schedule(db, user_id, inp)
    if name == "update_schedule":
        return _exec_update_schedule(db, user_id, inp)
    if name == "get_schedule":
        return _exec_get_schedule(db, user_id, inp)
    if name == "get_user_profile":
        return _exec_get_profile(db, user_id)
    if name == "analyze_progress":
        return _exec_analyze_progress(db, user_id)
    if name == "save_milestones":
        return _exec_save_milestones(db, user_id, inp)
    return {"error": f"Unknown tool: {name}"}


def run_agent(messages: list, user_id: int, db: Session) -> str:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return "FEL: ANTHROPIC_API_KEY saknas."

    try:
        client = anthropic.Anthropic(api_key=api_key)
    except Exception as e:
        return f"FEL klient: {str(e)}"

    today = _get_sweden_today()
    profile = _exec_get_profile(db, user_id)

    wake = profile.get("wake_time", "07:00")
    try:
        wh, wm = map(int, wake.split(":"))
        wake_30 = f"{wh:02d}:{(wm+30)%60:02d}" if wm < 30 else f"{(wh+1):02d}:{(wm-30):02d}"
        wake_60 = f"{(wh+1):02d}:{wm:02d}"
    except Exception:
        wake_30 = "07:30"
        wake_60 = "08:00"

    def _parse_hours(val, default='1'):
        if not val:
            return default
        return val.replace('h','').replace('+','').replace('timmar','').replace('timme','').strip() or default

    learning_h = _parse_hours(profile.get('learning_hours'), '2')
    training_h = _parse_hours(profile.get('training_duration'), '1')

    system = SYSTEM_PROMPT.format(
        today_date=today.isoformat(),
        today_weekday=_get_sweden_weekday(),
        profile=_profile_to_str(profile),
        learning_h=learning_h,
        training_h=training_h,
        wake=wake,
        wake_30=wake_30,
        wake_60=wake_60,
    )

    claude_messages = list(messages)
    week_schedule_saved = False

    for _ in range(10):
        try:
            response = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=4096,
                system=system,
                tools=TOOLS,
                messages=claude_messages,
            )
        except anthropic.APIStatusError as e:
            return f"FEL API {e.status_code}: {e.message}"
        except Exception as e:
            return f"FEL ({type(e).__name__}): {str(e)}"

        if response.stop_reason == "end_turn":
            text = "".join(b.text for b in response.content if hasattr(b, "text"))
            if week_schedule_saved and "[Gå till schemat]" not in text:
                text = text.rstrip() + "\n\n[Gå till schemat]"
            return text

        if response.stop_reason == "tool_use":
            claude_messages.append({"role": "assistant", "content": response.content})
            results = []
            for block in response.content:
                if block.type == "tool_use":
                    try:
                        result = _dispatch(block.name, block.input, db, user_id)
                        if block.name == "update_week_schedule" and result.get("ok"):
                            week_schedule_saved = True
                    except Exception as e:
                        result = {"error": f"Tool error {block.name}: {str(e)}"}
                    results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": json.dumps(result, ensure_ascii=False),
                    })
            claude_messages.append({"role": "user", "content": results})
        else:
            break

    return "Forlat, nagot gick fel internt. Forsok igen."
