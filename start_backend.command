#!/bin/bash
cd /Users/sashasenkov/Documents/inventory-crm/backend
echo "Запуск uvicorn main:app --reload ..."
uvicorn main:app --reload
