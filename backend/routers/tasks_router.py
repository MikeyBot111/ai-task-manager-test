from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

import auth
import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=list[schemas.TaskOut])
def list_tasks(
    status_filter: Optional[str] = Query(default=None, alias="status"),  # all/done/notdone
    priority: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    q = db.query(models.Task).filter(models.Task.owner_id == current_user.id)

    if status_filter == "done":
        q = q.filter(models.Task.is_done.is_(True))
    elif status_filter == "notdone":
        q = q.filter(models.Task.is_done.is_(False))

    if priority in ("Vysoká", "Střední", "Nízká"):
        q = q.filter(models.Task.priority == priority)

    return q.order_by(models.Task.is_done.asc(), models.Task.due_date.is_(None), models.Task.due_date.asc()).all()


@router.post("", response_model=schemas.TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    task = models.Task(**payload.model_dump(), owner_id=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def _get_owned_task(db: Session, user: models.User, task_id: int) -> models.Task:
    task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id, models.Task.owner_id == user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Úkol nenalezen.")
    return task


@router.patch("/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: int,
    payload: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    task = _get_owned_task(db, current_user, task_id)
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(task, k, v)
    db.commit()
    db.refresh(task)
    return task


@router.post("/{task_id}/toggle", response_model=schemas.TaskOut)
def toggle_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    task = _get_owned_task(db, current_user, task_id)
    task.is_done = not task.is_done
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    task = _get_owned_task(db, current_user, task_id)
    db.delete(task)
    db.commit()
    return None


@router.get("/dashboard", response_model=schemas.DashboardStats)
def dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    base = db.query(models.Task).filter(models.Task.owner_id == current_user.id)
    total = base.count()
    done = base.filter(models.Task.is_done.is_(True)).count()
    not_done = total - done

    soon = datetime.utcnow() + timedelta(days=3)
    upcoming = (
        base.filter(models.Task.is_done.is_(False))
        .filter(models.Task.due_date.isnot(None))
        .filter(models.Task.due_date <= soon)
        .count()
    )

    by_priority = {
        "Vysoká": base.filter(models.Task.priority == "Vysoká").count(),
        "Střední": base.filter(models.Task.priority == "Střední").count(),
        "Nízká": base.filter(models.Task.priority == "Nízká").count(),
    }

    return schemas.DashboardStats(
        total=total,
        done=done,
        not_done=not_done,
        upcoming=upcoming,
        by_priority=by_priority,
    )
