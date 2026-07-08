FROM python:3.11-slim
WORKDIR /app

COPY .venv_packages /app/packages
ENV PYTHONPATH="/app/packages"

COPY app ./app

EXPOSE ${PORT}
CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
