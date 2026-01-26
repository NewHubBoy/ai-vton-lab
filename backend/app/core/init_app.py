import shutil

from aerich import Command
from fastapi import FastAPI
from fastapi.middleware import Middleware
from fastapi.middleware.cors import CORSMiddleware
from tortoise.expressions import Q

from app.api import api_router
from app.controllers.api import api_controller
from app.controllers.user import UserCreate, user_controller
from app.core.exceptions import (
    DoesNotExist,
    DoesNotExistHandle,
    HTTPException,
    HttpExcHandle,
    IntegrityError,
    IntegrityHandle,
    RequestValidationError,
    RequestValidationHandle,
    ResponseValidationError,
    ResponseValidationHandle,
)
from app.log import logger
from app.models.admin import Api, Menu, Role
from app.models.prompt_config import (
    PromptCombinationRule,
    PromptConfigGroup,
    PromptConfigOption,
    PromptConfigSetting,
)
from app.schemas.menus import MenuType
from app.settings.config import settings

from .middlewares import BackGroundTaskMiddleware, HttpAuditLogMiddleware


def make_middlewares():
    middleware = [
        Middleware(
            CORSMiddleware,
            allow_origins=settings.CORS_ORIGINS,
            allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
            allow_methods=settings.CORS_ALLOW_METHODS,
            allow_headers=settings.CORS_ALLOW_HEADERS,
        ),
        Middleware(BackGroundTaskMiddleware),
        Middleware(
            HttpAuditLogMiddleware,
            methods=["GET", "POST", "PUT", "DELETE"],
            exclude_paths=[
                "/api/v1/base/access_token",
                "/docs",
                "/openapi.json",
            ],
        ),
    ]
    return middleware


def register_exceptions(app: FastAPI):
    app.add_exception_handler(DoesNotExist, DoesNotExistHandle)
    app.add_exception_handler(HTTPException, HttpExcHandle)
    app.add_exception_handler(IntegrityError, IntegrityHandle)
    app.add_exception_handler(RequestValidationError, RequestValidationHandle)
    app.add_exception_handler(ResponseValidationError, ResponseValidationHandle)


def register_routers(app: FastAPI, prefix: str = "/api"):
    app.include_router(api_router, prefix=prefix)


async def init_superuser():
    user = await user_controller.model.exists()
    if not user:
        await user_controller.create_user(
            UserCreate(
                username="admin",
                email="admin@admin.com",
                password="123456",
                is_active=True,
                is_superuser=True,
            )
        )


async def init_menus():
    menus = await Menu.exists()
    if not menus:
        parent_menu = await Menu.create(
            menu_type=MenuType.CATALOG,
            name="系统管理",
            path="/system",
            order=1,
            parent_id=0,
            icon="carbon:gui-management",
            is_hidden=False,
            component="Layout",
            keepalive=False,
            redirect="/system/user",
        )
        children_menu = [
            Menu(
                menu_type=MenuType.MENU,
                name="用户管理",
                path="user",
                order=1,
                parent_id=parent_menu.id,
                icon="material-symbols:person-outline-rounded",
                is_hidden=False,
                component="/system/user",
                keepalive=False,
            ),
            Menu(
                menu_type=MenuType.MENU,
                name="角色管理",
                path="role",
                order=2,
                parent_id=parent_menu.id,
                icon="carbon:user-role",
                is_hidden=False,
                component="/system/role",
                keepalive=False,
            ),
            Menu(
                menu_type=MenuType.MENU,
                name="菜单管理",
                path="menu",
                order=3,
                parent_id=parent_menu.id,
                icon="material-symbols:list-alt-outline",
                is_hidden=False,
                component="/system/menu",
                keepalive=False,
            ),
            Menu(
                menu_type=MenuType.MENU,
                name="API管理",
                path="api",
                order=4,
                parent_id=parent_menu.id,
                icon="ant-design:api-outlined",
                is_hidden=False,
                component="/system/api",
                keepalive=False,
            ),
            Menu(
                menu_type=MenuType.MENU,
                name="部门管理",
                path="dept",
                order=5,
                parent_id=parent_menu.id,
                icon="mingcute:department-line",
                is_hidden=False,
                component="/system/dept",
                keepalive=False,
            ),
            Menu(
                menu_type=MenuType.MENU,
                name="审计日志",
                path="auditlog",
                order=6,
                parent_id=parent_menu.id,
                icon="ph:clipboard-text-bold",
                is_hidden=False,
                component="/system/auditlog",
                keepalive=False,
            ),
        ]
        await Menu.bulk_create(children_menu)
        await Menu.create(
            menu_type=MenuType.MENU,
            name="一级菜单",
            path="/top-menu",
            order=2,
            parent_id=0,
            icon="material-symbols:featured-play-list-outline",
            is_hidden=False,
            component="/top-menu",
            keepalive=False,
            redirect="",
        )


async def init_apis():
    apis = await api_controller.model.exists()
    if not apis:
        await api_controller.refresh_api()


async def init_db():
    command = Command(tortoise_config=settings.get_tortoise_orm())
    try:
        await command.init_db(safe=True)
    except FileExistsError:
        pass

    await command.init()
    try:
        await command.migrate()
    except AttributeError:
        logger.warning("unable to retrieve model history from database, model history will be created from scratch")
        shutil.rmtree("migrations")
        await command.init_db(safe=True)

    await command.upgrade(run_in_transaction=True)


async def init_roles():
    roles = await Role.exists()
    if not roles:
        admin_role = await Role.create(
            name="管理员",
            desc="管理员角色",
        )
        user_role = await Role.create(
            name="普通用户",
            desc="普通用户角色",
        )

        # 分配所有API给管理员角色
        all_apis = await Api.filter(is_deleted=False).all()
        await admin_role.apis.add(*all_apis)
        # 分配所有菜单给管理员和普通用户
        all_menus = await Menu.filter(is_deleted=False).all()
        await admin_role.menus.add(*all_menus)
        await user_role.menus.add(*all_menus)

        # 为普通用户分配基本API
        basic_apis = await Api.filter(is_deleted=False, method__in=["GET"]) | Q(is_deleted=False, tags="基础模块")
        await user_role.apis.add(*basic_apis)

async def init_prompt_config():
    groups = [
        {
            "group_key": "gender",
            "group_name": "性别",
            "description": "模特性别",
            "input_type": "select",
            "is_multiple": False,
            "is_required": True,
            "placeholder": "请选择性别",
            "default_option_key": "female",
            "sort_order": 1,
            "is_active": True,
            "is_system": True,
        },
        {
            "group_key": "age",
            "group_name": "年龄",
            "description": "模特年龄段",
            "input_type": "select",
            "is_multiple": False,
            "is_required": True,
            "placeholder": "请选择年龄",
            "default_option_key": "young",
            "sort_order": 2,
            "is_active": True,
            "is_system": True,
        },
        {
            "group_key": "ethnicity",
            "group_name": "肤色/种族",
            "description": "模特肤色/种族",
            "input_type": "select",
            "is_multiple": False,
            "is_required": True,
            "placeholder": "请选择肤色/种族",
            "default_option_key": "asian",
            "sort_order": 3,
            "is_active": True,
            "is_system": True,
        },
        {
            "group_key": "clothing",
            "group_name": "服装",
            "description": "服装类型",
            "input_type": "checkbox",
            "is_multiple": True,
            "is_required": False,
            "placeholder": "请选择服装",
            "default_option_key": "t_shirt",
            "sort_order": 4,
            "is_active": True,
            "is_system": True,
        },
        {
            "group_key": "style",
            "group_name": "风格",
            "description": "拍摄风格",
            "input_type": "select",
            "is_multiple": False,
            "is_required": True,
            "placeholder": "请选择风格",
            "default_option_key": "fashion",
            "sort_order": 5,
            "is_active": True,
            "is_system": True,
        },
        {
            "group_key": "background",
            "group_name": "背景",
            "description": "拍摄背景",
            "input_type": "select",
            "is_multiple": False,
            "is_required": True,
            "placeholder": "请选择背景",
            "default_option_key": "solid",
            "sort_order": 6,
            "is_active": True,
            "is_system": True,
        },
        {
            "group_key": "lighting",
            "group_name": "光线",
            "description": "光线条件",
            "input_type": "checkbox",
            "is_multiple": True,
            "is_required": False,
            "placeholder": "请选择光线",
            "default_option_key": "natural",
            "sort_order": 7,
            "is_active": True,
            "is_system": True,
        },
        {
            "group_key": "camera",
            "group_name": "镜头",
            "description": "镜头类型",
            "input_type": "select",
            "is_multiple": False,
            "is_required": True,
            "placeholder": "请选择镜头",
            "default_option_key": "portrait",
            "sort_order": 8,
            "is_active": True,
            "is_system": True,
        },
    ]

    group_map = {}
    for group in groups:
        obj, _ = await PromptConfigGroup.get_or_create(
            group_key=group["group_key"],
            defaults=group,
        )
        group_map[group["group_key"]] = obj

    options = [
        {
            "group_key": "gender",
            "option_key": "female",
            "option_label": "女性",
            "prompt_text": "young woman, beautiful face",
            "prompt_order": 2,
            "sort_order": 1,
            "is_default": True,
        },
        {
            "group_key": "gender",
            "option_key": "male",
            "option_label": "男性",
            "prompt_text": "handsome man, masculine features",
            "prompt_order": 2,
            "sort_order": 2,
        },
        {
            "group_key": "age",
            "option_key": "young",
            "option_label": "年轻",
            "prompt_text": "20-25 years old",
            "prompt_order": 2,
            "sort_order": 1,
            "is_default": True,
        },
        {
            "group_key": "age",
            "option_key": "middle",
            "option_label": "中年",
            "prompt_text": "35-40 years old",
            "prompt_order": 2,
            "sort_order": 2,
        },
        {
            "group_key": "age",
            "option_key": "mature",
            "option_label": "成熟",
            "prompt_text": "45-50 years old",
            "prompt_order": 2,
            "sort_order": 3,
        },
        {
            "group_key": "ethnicity",
            "option_key": "asian",
            "option_label": "亚洲",
            "prompt_text": "asian skin tone",
            "prompt_order": 2,
            "sort_order": 1,
            "is_default": True,
        },
        {
            "group_key": "clothing",
            "option_key": "t_shirt",
            "option_label": "T恤",
            "prompt_text": "white t-shirt",
            "prompt_order": 2,
            "sort_order": 1,
        },
        {
            "group_key": "clothing",
            "option_key": "jeans",
            "option_label": "牛仔裤",
            "prompt_text": "blue jeans",
            "prompt_order": 2,
            "sort_order": 2,
        },
        {
            "group_key": "clothing",
            "option_key": "dress",
            "option_label": "连衣裙",
            "prompt_text": "elegant dress",
            "prompt_order": 2,
            "sort_order": 3,
        },
        {
            "group_key": "style",
            "option_key": "fashion",
            "option_label": "时尚",
            "prompt_text": "fashion photography, high fashion",
            "prompt_order": 3,
            "sort_order": 1,
            "is_default": True,
        },
        {
            "group_key": "style",
            "option_key": "cinematic",
            "option_label": "电影感",
            "prompt_text": "cinematic lighting, movie still",
            "prompt_order": 3,
            "sort_order": 2,
        },
        {
            "group_key": "style",
            "option_key": "business",
            "option_label": "商务",
            "prompt_text": "business attire, formal look",
            "prompt_order": 3,
            "sort_order": 3,
        },
        {
            "group_key": "background",
            "option_key": "solid",
            "option_label": "纯色",
            "prompt_text": "solid color background, white",
            "prompt_order": 3,
            "sort_order": 1,
            "is_default": True,
        },
        {
            "group_key": "background",
            "option_key": "gradient",
            "option_label": "渐变",
            "prompt_text": "gradient background, soft colors",
            "prompt_order": 3,
            "sort_order": 2,
        },
        {
            "group_key": "background",
            "option_key": "outdoor",
            "option_label": "户外",
            "prompt_text": "outdoor background",
            "prompt_order": 3,
            "sort_order": 3,
        },
        {
            "group_key": "background",
            "option_key": "nature",
            "option_label": "自然",
            "prompt_text": "nature scenery",
            "prompt_order": 3,
            "sort_order": 4,
        },
        {
            "group_key": "background",
            "option_key": "night",
            "option_label": "夜景",
            "prompt_text": "night scene",
            "prompt_order": 3,
            "sort_order": 5,
        },
        {
            "group_key": "background",
            "option_key": "indoor",
            "option_label": "室内",
            "prompt_text": "indoor background",
            "prompt_order": 3,
            "sort_order": 6,
        },
        {
            "group_key": "lighting",
            "option_key": "natural",
            "option_label": "自然光",
            "prompt_text": "natural lighting",
            "prompt_order": 3,
            "sort_order": 1,
            "is_default": True,
        },
        {
            "group_key": "lighting",
            "option_key": "soft",
            "option_label": "柔光",
            "prompt_text": "soft lighting",
            "prompt_order": 3,
            "sort_order": 2,
        },
        {
            "group_key": "camera",
            "option_key": "portrait",
            "option_label": "人像",
            "prompt_text": "portrait photography",
            "prompt_order": 3,
            "sort_order": 1,
            "is_default": True,
        },
        {
            "group_key": "camera",
            "option_key": "wide",
            "option_label": "广角",
            "prompt_text": "wide angle",
            "prompt_order": 3,
            "sort_order": 2,
        },
    ]

    for option in options:
        group = group_map[option.pop("group_key")]
        await PromptConfigOption.get_or_create(
            group=group,
            option_key=option["option_key"],
            defaults=option,
        )

    settings_data = [
        {
            "key": "global_negative_prompt",
            "value": "no text, no watermark, low quality, blurry",
            "value_type": "text",
            "description": "全局负面提示词",
            "group_name": "prompt",
            "sort_order": 1,
            "is_editable": True,
        },
        {
            "key": "prompt_separator",
            "value": ", ",
            "value_type": "text",
            "description": "片段分隔符",
            "group_name": "prompt",
            "sort_order": 2,
            "is_editable": True,
        },
        {
            "key": "prompt_order",
            "value": "gender,age,ethnicity,clothing,style,background,lighting,camera",
            "value_type": "list",
            "description": "提示词组装顺序",
            "group_name": "prompt",
            "sort_order": 3,
            "is_editable": True,
        },
        {
            "key": "max_prompt_length",
            "value": "1000",
            "value_type": "text",
            "description": "最大提示词长度",
            "group_name": "prompt",
            "sort_order": 4,
            "is_editable": True,
        },
        {
            "key": "default_resolution",
            "value": "1024x1024",
            "value_type": "text",
            "description": "默认分辨率",
            "group_name": "generation",
            "sort_order": 1,
            "is_editable": True,
        },
        {
            "key": "default_aspect_ratio",
            "value": "1:1",
            "value_type": "text",
            "description": "默认宽高比",
            "group_name": "generation",
            "sort_order": 2,
            "is_editable": True,
        },
    ]
    for setting in settings_data:
        await PromptConfigSetting.get_or_create(
            key=setting["key"],
            defaults=setting,
        )

    rules = [
        {
            "name": "户外场景加自然光",
            "description": "背景为户外或自然时追加自然光",
            "condition_json": {"group_key": "background", "option_keys": ["outdoor", "nature"]},
            "action_type": "append",
            "target": "positive",
            "action_prompt": "natural sunlight, golden hour",
            "priority": 10,
            "is_active": True,
        },
        {
            "name": "夜景加人工灯光",
            "description": "夜景/室内场景追加人工灯光",
            "condition_json": {"group_key": "background", "option_keys": ["night", "indoor"]},
            "action_type": "append",
            "target": "positive",
            "action_prompt": "artificial lighting, studio lights",
            "priority": 10,
            "is_active": True,
        },
        {
            "name": "商务正装移除休闲",
            "description": "商务风格移除休闲描述",
            "condition_json": {"group_key": "style", "option_keys": ["business"]},
            "action_type": "remove",
            "target": "positive",
            "action_prompt": "casual, relaxed",
            "priority": 20,
            "is_active": True,
        },
    ]
    for rule in rules:
        exists = await PromptCombinationRule.filter(name=rule["name"]).exists()
        if not exists:
            await PromptCombinationRule.create(**rule)


async def init_data():
    await init_db()
    await init_superuser()
    await init_menus()
    await init_apis()
    await init_roles()
    await init_prompt_config()
