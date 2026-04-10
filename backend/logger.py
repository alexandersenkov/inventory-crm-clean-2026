# backend/logger.py
import logging
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path

# Создаём папку для логов, если её нет
LOG_DIR = Path(__file__).parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

# Настройка форматтера
formatter = logging.Formatter(
	fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(filename)s:%(lineno)d | %(message)s",
	datefmt="%Y-%m-%d %H:%M:%S"
)

# Обработчик для консоли (цветной можно добавить при желании)
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(formatter)
console_handler.setLevel(logging.DEBUG)

# Обработчик для файла с ротацией (макс. 5 МБ, храним 3 файла)
file_handler = RotatingFileHandler(
	LOG_DIR / "app.log",
	maxBytes=5*1024*1024,
	backupCount=3,
	encoding="utf-8"
)
file_handler.setFormatter(formatter)
file_handler.setLevel(logging.INFO)

# Настройка корневого логгера
def setup_logging(level=logging.DEBUG):
	root_logger = logging.getLogger()
	root_logger.setLevel(level)
	# Удаляем стандартные обработчики, чтобы не дублировались
	root_logger.handlers.clear()
	root_logger.addHandler(console_handler)
	root_logger.addHandler(file_handler)
	
	# Отключаем слишком подробные логи от библиотек
	logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
	logging.getLogger("uvicorn.error").setLevel(logging.INFO)
	
	return root_logger

# Получить логгер для модуля
def get_logger(name: str = __name__):
	return logging.getLogger(name)