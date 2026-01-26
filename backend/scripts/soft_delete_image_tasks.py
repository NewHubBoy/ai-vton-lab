#!/usr/bin/env python
"""软删除所有画图任务记录"""
import pymysql

# MySQL 配置（本地映射端口）
conn = pymysql.connect(
    host='127.0.0.1',
    port=3306,
    user='ai_vton_user',
    password='vton_9f3cX2',
    database='ai_vton_lab_DB',
    charset='utf8mb4'
)

cursor = conn.cursor()

# 检查表是否存在
cursor.execute("SHOW TABLES LIKE 'image_task'")
if not cursor.fetchone():
    print("表 image_task 不存在，请先启动服务创建数据库")
    conn.close()
    exit(1)

# 检查 is_deleted 字段是否存在
cursor.execute("DESCRIBE image_task")
columns = [row[0] for row in cursor.fetchall()]
print(f"表字段: {columns}")

if 'is_deleted' not in columns:
    print("添加 is_deleted 字段...")
    cursor.execute("ALTER TABLE image_task ADD COLUMN is_deleted TINYINT(1) DEFAULT 0")
    conn.commit()

# 查询总数
cursor.execute("SELECT COUNT(*) FROM image_task")
total = cursor.fetchone()[0]
print(f"总记录数: {total}")

# 软删除所有记录
cursor.execute("UPDATE image_task SET is_deleted = 1")
print(f"已软删除: {cursor.rowcount} 条记录")

conn.commit()
conn.close()
print("完成!")
