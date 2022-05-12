#!/usr/bin/env bash
cd backend
poetry run uvicorn app:app --reload
