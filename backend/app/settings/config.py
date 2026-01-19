import os
import typing

from pydantic_settings import BaseSettings, SettingsConfigDict


class DatabaseSettings(BaseSettings):
    """数据库配置"""
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DB_TYPE: str = "mysql"  # sqlite, mysql, postgres
    DB_HOST: str = "mysql"
    DB_PORT: int = 3306
    DB_USER: str = "ai_vton_user"
    DB_PASSWORD: str = "vton_9f3cX2"
    DB_NAME: str = "ai_vton_lab_DB"


db_settings = DatabaseSettings()


class Settings(BaseSettings):
    VERSION: str = "0.1.0"
    APP_TITLE: str = "Vue FastAPI Admin"
    PROJECT_NAME: str = "Vue FastAPI Admin"
    APP_DESCRIPTION: str = "Description"

    CORS_ORIGINS: typing.List = ["*"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: typing.List = ["*"]
    CORS_ALLOW_HEADERS: typing.List = ["*"]

    DEBUG: bool = True

    PROJECT_ROOT: str = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
    BASE_DIR: str = os.path.abspath(os.path.join(PROJECT_ROOT, os.pardir))
    LOGS_ROOT: str = os.path.join(BASE_DIR, "app/logs")
    SECRET_KEY: str = "3488a63e1765035d386f05409663f55c83bfae3b3c61a932744b20ad14244dcf"  # openssl rand -hex 32
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 day
    # 根据 DB_TYPE 动态生成数据库连接配置
    @staticmethod
    def get_tortoise_orm():
        connections = {}
        default_conn = "mysql"

        if db_settings.DB_TYPE == "mysql":
            connections["mysql"] = {
                "engine": "tortoise.backends.mysql",
                "credentials": {
                    "host": db_settings.DB_HOST,
                    "port": db_settings.DB_PORT,
                    "user": db_settings.DB_USER,
                    "password": db_settings.DB_PASSWORD,
                    "database": db_settings.DB_NAME,
                },
            }
            default_conn = "mysql"
        else:
            # 默认使用 SQLite
            connections["sqlite"] = {
                "engine": "tortoise.backends.sqlite",
                "credentials": {"file_path": f"{BASE_DIR}/db.sqlite3"},
            }
            default_conn = "sqlite"

        return {
            "connections": connections,
            "apps": {
                "models": {
                    "models": ["app.models", "aerich.models"],
                    "default_connection": default_conn,
                },
            },
            "use_tz": False,
            "timezone": "Asia/Shanghai",
        }

    TORTOISE_ORM: dict = {}
    DATETIME_FORMAT: str = "%Y-%m-%d %H:%M:%S"


settings = Settings()
