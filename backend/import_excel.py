# backend/import_excel.py
import pandas as pd
import requests
import sys
import json

# ================= НАСТРОЙКИ =================
API_URL = "http://127.0.0.1:8000"
EXCEL_FILE = input("📁 Путь к Excel файлу: ").strip()

# Сопоставление колонок Excel → поля API
# Измените под свои названия колонок в Excel!
COLUMN_MAPPING = {
	"Название": "name",
	"Инвентарный номер": "inv_num",
	"Серийный номер": "sn",
	"MAC адрес": "mac",
	"Заводской номер": "zav_num",
	"Производитель": "vendor",
	"Модель": "model",
	"Имя хоста": "hostname",
	"Улица": "street",
	"Корпус": "kor",
	"Этаж": "etaj",
	"Кабинет": "kab",
	"Статус": "status",
	"Состояние": "condition",
	"Примечания": "other",
}

# ================= ФУНКЦИИ =================
def get_token(username: str, password: str) -> str:
	"""Получить токен доступа"""
	response = requests.post(f"{API_URL}/login", json={
		"username": username,
		"password": password
	})
	if response.status_code == 200:
		return response.json()["access_token"]
	else:
		print(f"❌ Ошибка входа: {response.text}")
		sys.exit(1)

def import_equipment(data: dict, token: str) -> bool:
	"""Отправить одну запись в API"""
	headers = {"Authorization": f"Bearer {token}"}
	
	# Значения по умолчанию
	payload = {
		"name": "",
		"inv_num": "",
		"sn": "",
		"mac": "",
		"zav_num": "",
		"vendor": "",
		"model": "",
		"hostname": "",
		"street": "",
		"kor": "",
		"etaj": "",
		"kab": "",
		"status": "в работе",
		"condition": "готов к эксплуатации",
		"other": ""
	}
	
	# Объединяем с данными из Excel
	payload.update(data)
	
	response = requests.post(
		f"{API_URL}/equipment",
		json=payload,
		headers=headers
	)
	return response.status_code == 200

def preview_mapping(df: pd.DataFrame, mapping: dict):
	"""Показать, как будут сопоставлены колонки"""
	print("\n📋 СОПОСТАВЛЕНИЕ КОЛОНОК:")
	print("-" * 50)
	for excel_col, api_field in mapping.items():
		if excel_col in df.columns:
			sample = str(df[excel_col].iloc[0])[:30] if len(df) > 0 else ""
			print(f"  {excel_col} → {api_field} (пример: {sample})")
		else:
			print(f"  ⚠️ {excel_col} → {api_field} (КОЛОНКА НЕ НАЙДЕНА)")
	print("-" * 50)

# ================= ОСНОВНОЙ КОД =================
def main():
	print("🚀 ИМПОРТ ОБОРУДОВАНИЯ ИЗ EXCEL")
	print("=" * 50)
	
	# 1. Вход в систему
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
	
	# 3. Показываем сопоставление
	preview_mapping(df, COLUMN_MAPPING)
	
	# 4. Подтверждение
	confirm = input("\n⚠️ Продолжить импорт? (y/n): ")
	if confirm.lower() != 'y':
		print("❌ Импорт отменён")
		sys.exit(0)
	
	# 5. Импорт
	print("\n⏳ Импорт...")
	success = 0
	failed = 0
	
	for idx, row in df.iterrows():
		# Преобразуем строку в данные для API
		equipment_data = {}
		for excel_col, api_field in COLUMN_MAPPING.items():
			if excel_col in df.columns:
				value = row[excel_col]
				if pd.notna(value):
					equipment_data[api_field] = str(value).strip()
		
		# Показываем прогресс
		name = equipment_data.get("name", "Без названия")[:30]
		print(f"  [{idx+1:3d}/{len(df)}] {name}...", end=" ")
		
		if import_equipment(equipment_data, token):
			print("✅")
			success += 1
		else:
			print("❌")
			failed += 1
	
	# 6. Итоги
	print("\n" + "=" * 50)
	print("📊 ИТОГИ ИМПОРТА:")
	print(f"  ✅ Успешно: {success}")
	print(f"  ❌ Ошибок: {failed}")
	print(f"  📋 Всего: {len(df)}")
	print("=" * 50)

if __name__ == "__main__":
	main()