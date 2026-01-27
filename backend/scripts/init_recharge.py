"""初始化充值相关数据"""
import asyncio
from tortoise import Tortoise

from app.settings.config import TORTOISE_ORM


async def init_recharge_data():
    await Tortoise.init(config=TORTOISE_ORM)
    await Tortoise.generate_schemas()

    from app.models.admin import Menu, User
    from app.models.recharge import RechargeConfig

    # 检查是否已存在充值菜单
    existing_menu = await Menu.filter(path='/business/recharge').first()
    if not existing_menu:
        # 获取 business 父菜单
        parent_menu = await Menu.filter(path='/business').first()
        parent_id = parent_menu.id if parent_menu else 0

        # 创建充值菜单
        await Menu.create(
            name='充值管理',
            path='/business/recharge',
            component='business/recharge/page',
            order=6,
            parent_id=parent_id,
            menu_type='menu',
            icon='CircleDollarSign',
            is_hidden=False,
            keepalive=True,
        )
        print('创建充值菜单成功')

    # 检查是否已有默认充值配置
    existing_configs = await RechargeConfig.all()
    if not existing_configs:
        # 创建默认充值配置
        configs = [
            {'name': '基础套餐', 'amount': 10, 'credits': 1000, 'description': '性价比首选', 'sort_order': 1},
            {'name': '标准套餐', 'amount': 50, 'credits': 5500, 'description': '买50送5', 'sort_order': 2},
            {'name': '高级套餐', 'amount': 100, 'credits': 12000, 'description': '买100送20', 'sort_order': 3, 'bonus_ratio': 0.2},
            {'name': '豪华套餐', 'amount': 500, 'credits': 65000, 'description': '买500送150', 'sort_order': 4, 'bonus_ratio': 0.3},
        ]
        for cfg in configs:
            await RechargeConfig.create(**cfg)
        print('创建默认充值配置成功')

    await Tortoise.close_connections()
    print('初始化完成')


if __name__ == '__main__':
    asyncio.run(init_recharge_data())
