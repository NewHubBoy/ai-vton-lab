# 前后端面试题 + 参考答

> 面向前端为主、后端只基础的复习材料。题目覆盖 React / Next.js / Vue 生态 + 后端 Python / Go / Java 基础与通用后端知识。

## 一、前端通用基础

1. **事件循环（Event Loop）是什么？宏任务和微任务有什么区别？**  
   **答：** JS 单线程通过事件循环调度任务。宏任务如 setTimeout、I/O；微任务如 Promise.then、MutationObserver。执行顺序：同步代码 -> 清空微任务 -> 执行一个宏任务 -> 再清空微任务。

2. **浏览器从输入 URL 到页面显示发生了什么？**  
   **答：** 解析 URL -> DNS -> TCP/HTTPS -> 请求/响应 -> HTML 解析构建 DOM -> CSSOM -> 合成渲染树 -> 布局 -> 绘制 -> 合成。

3. **回流和重绘的区别？如何优化？**  
   **答：** 回流涉及布局计算，重绘只更新像素。优化：减少频繁读写 layout 属性、批量更新、使用 transform/opacity 触发合成。

4. **前端性能优化有哪些常见手段？**  
   **答：** 代码分割、懒加载、缓存策略、图片压缩、CDN、减少重排、使用虚拟列表、SSR/SSG。

5. **跨域有哪些解决方案？**  
   **答：** CORS、JSONP、反向代理、postMessage、iframe + domain。

6. **前端常见鉴权方式？**  
   **答：** Cookie + Session、JWT、OAuth。注意 XSS/CSRF 防护。

7. **ESM 和 CommonJS 区别？**  
   **答：** ESM 静态导入、支持 tree-shaking；CJS 动态 require，运行时加载。

8. **前端工程化做了什么？**  
   **答：** 模块打包、转译、压缩、静态资源处理、开发服务器、热更新、Lint/格式化。

9. **如何理解浏览器缓存？**  
   **答：** 强缓存（Cache-Control/Expires）优先；协商缓存（ETag/Last-Modified）返回 304。

10. **XSS 与 CSRF 区别？**  
    **答：** XSS 注入脚本攻击用户；CSRF 伪造请求利用用户登录态。防护：输入过滤、CSP、SameSite、CSRF Token。

## 二、React 生态

1. **React 渲染机制与更新流程？**  
   **答：** state/props 变化触发 render -> 生成虚拟 DOM -> diff -> 最小化更新真实 DOM。

2. **useEffect 依赖项为什么重要？**  
   **答：** 依赖决定 effect 何时重跑；遗漏会产生闭包旧值或重复执行。

3. **useMemo 与 useCallback 有什么区别？**  
   **答：** useMemo 缓存计算结果；useCallback 缓存函数引用，避免子组件重复渲染。

4. **React 组件通信方式？**  
   **答：** 父子 props、Context、事件回调、状态管理库（Redux/Zustand）。

5. **React 性能优化手段？**  
   **答：** React.memo、useMemo/useCallback、key 稳定、避免不必要 re-render、虚拟列表。

6. **Redux 和 Zustand 的区别？**  
   **答：** Redux 更规范（action/reducer），适合复杂应用；Zustand 更轻量、API 简洁。

## 三、Next.js 生态

1. **SSR/SSG/ISR/CSR 区别？**  
   **答：** SSR 每次请求渲染；SSG 构建时生成静态页；ISR 定时增量更新；CSR 仅客户端渲染。

2. **Next.js 的 App Router 与 Pages Router 区别？**  
   **答：** App Router 支持 server components、嵌套 layout；Pages Router 传统路由结构。

3. **Next.js 中数据获取方式有哪些？**  
   **答：** App Router 用 fetch + cache 配置；Pages Router 使用 getServerSideProps/getStaticProps。

4. **Next.js API Routes 的用途？**  
   **答：** 快速构建轻量后端接口（BFF），便于与前端同仓部署。

## 四、Vue 生态

1. **Vue2/3 响应式原理区别？**  
   **答：** Vue2 基于 Object.defineProperty；Vue3 使用 Proxy，性能更好并支持动态属性。

2. **Vue 生命周期常见钩子？**  
   **答：** beforeMount/mounted, beforeUpdate/updated, beforeUnmount/unmounted。

3. **Vue 组件通信方式？**  
   **答：** props/emit、provide/inject、全局 store（Pinia/Vuex）。

4. **Composition API 的优势？**  
   **答：** 逻辑复用更清晰，便于按功能组织代码。

## 五、后端通用基础

1. **数据库事务四大特性（ACID）？**  
   **答：** 原子性、一致性、隔离性、持久性。

2. **索引的作用？常见索引结构？**  
   **答：** 提升查询速度。常见 B+Tree、哈希索引。注意写入成本。

3. **常见缓存问题与解决？**  
   **答：** 缓存穿透（布隆过滤）、击穿（互斥锁/热点预热）、雪崩（随机过期时间）。

4. **REST 与 RPC 区别？**  
   **答：** REST 面向资源、语义清晰；RPC 面向过程、传输效率高。

5. **限流有哪些策略？**  
   **答：** 固定窗口、滑动窗口、令牌桶、漏桶。

## 六、Python 基础

1. **GIL 是什么？对并发有什么影响？**  
   **答：** 全局解释器锁限制同一时刻只能一个线程执行 Python 字节码，CPU 密集型多线程效果差。

2. **协程和线程区别？**  
   **答：** 协程轻量、单线程内调度；线程系统调度，切换成本更高。

3. **Python 中常用数据结构？**  
   **答：** list、dict、set、tuple，dict 查找平均 O(1)。

## 七、Golang 基础

1. **goroutine 与 thread 区别？**  
   **答：** goroutine 更轻量，调度由 Go runtime 控制，数量可达成千上万。

2. **channel 的用途？**  
   **答：** goroutine 间通信与同步，避免共享内存。

3. **切片与数组区别？**  
   **答：** 数组定长；切片是对数组的视图，动态扩容。

## 八、Java 基础

1. **JVM 内存区域有哪些？**  
   **答：** 堆、栈、方法区、程序计数器、本地方法栈。

2. **垃圾回收基本原理？**  
   **答：** 可达性分析 + 分代回收（新生代/老年代）。

3. **synchronized 和 volatile 区别？**  
   **答：** synchronized 提供互斥与可见性；volatile 仅保证可见性和禁止指令重排。

---

如果你需要：
- 题目难度分级（初级/中级/高级）
- 题库按框架拆分 + 重点高频题
- 真题模拟 + 答案润色

告诉我你的目标岗位和面试时间。
