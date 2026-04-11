# backend/import_excel.py
import pandas as pd
import requests
import sys
import json
from datetime import datetime

# ================= НАСТРОЙКИ =================
API_URL = "http://127.0.0.1:8000"
EXCEL_FILE = input("📁 Путь к Excel файлу: ").strip()

# Сопоставление колонок Excel → поля API
COLUMN_MAPPING = {
"name": "name",
"INV№": "inv_number",
"S/N": "serial_number",
"mac_address": "MAC_address",
"Заводской номер": "factory_number",
"Производитель": "vendor",
"Модель": "model",
"хостнейм": "hostname",
"адрес": "street",
"корпус": "frame",          # теперь целое
"этаж": "floor",
"кабинет": "room",
"status": "status",
"Состояние": "condition",
"прочее": "other",
"МОЛ": "Mol",
"МОЛ1": "Mol_fio",
"дата": "Inventory_dt",
#"Дата изменения": "update_dt",
}

# ================= ФУНКЦИИ =================
def get_token(username: str, password: str) -> str:
	response = requests.post(f"{API_URL}/login", json={
		"username": username,
		"password": password
	})
	if response.status_code == 200:
		return response.json()["access_token"]
	else:
		print(f"❌ Ошибка входа: {response.text}")
		sys.exit(1)

def safe_int(value):
	"""Преобразует значение в int, обрабатывая строки с .0 и пустые значения."""
	if pd.isna(value) or value == "":
		return None
	try:
		# Если строка с десятичной точкой, например "4.0"
		return int(float(value))
	except (ValueError, TypeError):
		return None

def safe_date(value):
	"""Преобразует значение в строку даты YYYY-MM-DD или None."""
	if pd.isna(value) or value == "":
		return None
	try:
		if isinstance(value, datetime):
			return value.date().isoformat()
		if isinstance(value, str):
			# Попытка распарсить разные форматы
			for fmt in ("%Y-%m-%d", "%d.%m.%Y", "%m/%d/%Y"):
				try:
					dt = datetime.strptime(value, fmt)
					return dt.date().isoformat()
				except ValueError:
					continue
		# Если не получилось, возвращаем None
		return None
	except:
		return None

def import_equipment(data: dict, token: str) -> bool:
	"""Отправить одну запись в API."""
	headers = {"Authorization": f"Bearer {token}"}
	
	# Базовые значения по умолчанию
	payload = {
		"name": "",
		"inv_number": "",
		"serial_number": "",
		"MAC_address": "",
		"factory_number": "",
		"vendor": "",
		"model": "",
		"hostname": "",
		"street": "",
		"frame": None,
		"floor": "",
		"room": "",
		"status": "в работе",
		"condition": "готов к эксплуатации",
		"other": "",
		"Mol": "",
		"Mol_fio": "",
		"Inventory_dt": None,
		"update_dt": None
	}
	
	# Обновляем данными из Excel
	payload.update(data)
	
	# Убираем None значения для необязательных полей (fastapi поймёт)
	# Но frame должен быть либо int, либо отсутствовать
	if payload["frame"] is None:
		payload.pop("frame", None)
	
	response = requests.post(
		f"{API_URL}/equipment",
		json=payload,
		headers=headers
	)
	if response.status_code == 200:
		return True
	else:
		print(f"  Ошибка {response.status_code}: {response.text[:100]}")
		return False

# ================= ОСНОВНОЙ КОД =================
def main():
	print("🚀 ИМПОРТ ОБОРУДОВАНИЯ ИЗ EXCEL")
	print("=" * 50)
	
	# 1. Вход
	username = input("👤 Логин: ")
	password = input("🔑 Пароль: ")
	token = get_token(username, password)
	print("✅ Авторизация успешна\n")
	
	# 2. Чтение Excel
	try:
		df = pd.read_excel(EXCEL_FILE)
		print(f"📊 Загружено {len(df)} записей")
		print(f"📋 Колонки в файле: {list(df.columns)}\n")
	except Exception as e:
		print(f"❌ Ошибка чтения Excel: {e}")
		sys.exit(1)
	
	# 3. Сопоставление (показываем, какие колонки нашлись)
	print("📋 СОПОСТАВЛЕНИЕ КОЛОНОК:")
	print("-" * 50)
	for excel_col, api_field in COLUMN_MAPPING.items():
		if excel_col in df.columns:
			sample = str(df[excel_col].iloc[0])[:30] if len(df) > 0 else ""
			print(f"  {excel_col} → {api_field} (пример: {sample})")
		else:
			print(f"  ⚠️ {excel_col} → {api_field} (КОЛОНКА НЕ НАЙДЕНА)")
	print("-" * 50)
	
	confirm = input("\n⚠️ Продолжить импорт? (y/n): ")
	if confirm.lower() != 'y':
		print("❌ Импорт отменён")
		sys.exit(0)
	
	# 4. Импорт
	print("\n⏳ Импорт...")
	success = 0
	failed = 0
	
	for idx, row in df.iterrows():
		equipment_data = {}
		for excel_col, api_field in COLUMN_MAPPING.items():
			if excel_col in df.columns:
				value = row[excel_col]
				if pd.isna(value):
					continue
				# Специальная обработка для числовых полей и дат
				if api_field == "frame":
					equipment_data[api_field] = safe_int(value)
				elif api_field in ("Inventory_dt", "update_dt"):
					equipment_data[api_field] = safe_date(value)
				else:
					equipment_data[api_field] = str(value).strip()
		
		name = equipment_data.get("name", "Без названия")[:30]
		print(f"  [{idx+1:3d}/{len(df)}] {name}...", end=" ")
		
		if import_equipment(equipment_data, token):
			print("✅")
			success += 1
		else:
			print("❌")
			failed += 1
	
	# 5. Итоги
	print("\n" + "=" * 50)
	print("📊 ИТОГИ ИМПОРТА:")
	print(f"  ✅ Успешно: {success}")
	print(f"  ❌ Ошибок: {failed}")
	print(f"  📋 Всего: {len(df)}")
	print("=" * 50)

if __name__ == "__main__":
	main()