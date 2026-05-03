from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    trial_started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    is_subscribed = Column(Boolean, default=False, nullable=True)
    profile = relationship("Profile", back_populates="user", uselist=False)
    schedules = relationship("Schedule", back_populates="user")
    thoughts = relationship("Thought", back_populates="user")
    lists = relationship("TaskList", back_populates="user")
    habits = relationship("Habit", back_populates="user")
    chat_messages = relationship("ChatMessage", back_populates="user")
    milestones = relationship("Milestone", back_populates="user", uselist=False)


class Profile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    name = Column(String, nullable=True)
    age = Column(String, nullable=True)
    situation = Column(String, nullable=True)
    goals = Column(JSON, nullable=True)
    education = Column(String, nullable=True)
    experience = Column(String, nullable=True)
    budget = Column(String, nullable=True)
    time_per_day = Column(String, nullable=True)
    discipline = Column(String, nullable=True)
    work_style = Column(String, nullable=True)
    completed = Column(Boolean, default=False)
    raw = Column(JSON, nullable=True, default=dict)
    user = relationship("User", back_populates="profile")


class Schedule(Base):
    __tablename__ = "schedules"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(String, index=True)
    timeframe = Column(String, default="Idag")
    tasks = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="schedules")


class Thought(Base):
    __tablename__ = "thoughts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="thoughts")


class TaskList(Base):
    __tablename__ = "task_lists"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    items = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="lists")


class Habit(Base):
    __tablename__ = "habits"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    color = Column(String, default="#14B8A6")
    completions = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="habits")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="chat_messages")


class Milestone(Base):
    __tablename__ = "milestones"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    data = Column(JSON, default=list)
    updated_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="milestones")
