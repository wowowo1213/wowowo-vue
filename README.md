# Wowowo-Vue

**Vue3 核心功能实现解析（基于源码学习）**

> 📚 本项目通过手写实现 Vue3 的核心响应式模块，帮助开发者深入理解其底层原理。基于 Vue3 源码学习，采用 monorepo 架构组织代码。

## 目前包含的模块

### `reactivity`

`reactive`、`effect`、`ref`、`toRef/toRefs`、`computed`、`watch/watchEffect`

### `runtime-dom`

`nodeOps`、`patchProp`、`render`

### `runtime-core`

`createRenderer`、`h`、`createVnode`

## 运行命令

```bash
# 这样可以生成packages/reactivity的打包文件
# 输出路径在packages/reactivity/dist下
npm run dev:reactivity
```
