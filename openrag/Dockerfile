FROM python:3.11-slim
WORKDIR /app
RUN pip install fastapi uvicorn
COPY mock_openrag.py .
CMD ["uvicorn", "mock_openrag:app", "--host", "0.0.0.0", "--port", "3000"]
