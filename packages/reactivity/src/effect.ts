// 这个暴露出去给proxy的get函数使用
export let activeEffect;

function preCleanEffect(effect) {
  effect._depsLength = 0;
  effect._trackId++; // 执行一次id就自加1，如果当前同一个effect执行，id就是相同的
}

function postCleanEffect(effect) {
  if (effect.deps.length > effect._depsLength) {
    for (let i = effect._depsLength; i < effect.deps.length; i++) {
      // 去掉dep中的effect，同时dep大小为0时在depsMap中去掉map
      // 这样的话，当dep的size为0的时候，depsMap中没有这个key的dep了，setter的时候就不会调用effect的scheduler
      cleanDepEffect(effect.deps[i], effect);
    }
    // 这边去掉effect中多余的dep
    effect.deps.length = effect._depsLength;
  }
}

class ReactiveEffect {
  // 用于记录当前effect执行次数，方便进行deps中的dep去除
  _trackId = 0;
  // 用于保证deps的添加顺序，也就是索引值
  _depsLength = 0;
  // 这个_running用来判断是否正在运行
  _running = 0;
  // 用于记录存放的依赖
  deps = [];

  // active表示是否设置effect是响应式的
  public active = true;
  // public 表示把属性放到实例上
  // fn为用户编写的函数
  // scheduler为fn中依赖的数据发生变化后调用的更新函数，用来更新视图
  constructor(
    public fn,
    public scheduler
  ) {}

  run() {
    if (!this.active) return this.fn(); // effect不是激活的，执行后，什么都不用做
    let lastEffect = activeEffect;
    try {
      // 依赖收集 -> 收集fn中用到的响应式数据的属性 -> 到proxy的get函数中处理 -> baseHandler.ts文件
      activeEffect = this;
      // effect重新执行前，需要将上一次的依赖情况进行清除
      preCleanEffect(this);
      this._running++;
      return this.fn();
    } finally {
      this._running--;
      // 清除depsMap中超过当前长度的dep，这些dep也是多余的
      // 和 preCleanEffect相呼应，一个一开始重置，一个去除多余的
      postCleanEffect(this);
      // activeEffect = undefined;
      // 这样的话，当我们执行完这个run函数之后，再去访问reactive的响应式数据的属性的时候，这个activeEffect已经被清除了
      // 但是这样不完善
      // 因为当一个effect函数中有一个effect函数的时候
      // 我们记第一个effect函数的activeEffect为e1
      // 记第二个effect函数的activeEffect为e2
      // 则e2对应的run执行完毕后activeEffect会变为undefined，然后e1中在e2后面的代码中的响应式属性就无法被收集到了
      activeEffect = lastEffect; // 这样就行了
    }
  }

  // effect.stop方法停止所有的effect，不参加响应式处理
  stop() {
    this.active = false;
  }
}

export function effect(fn: Function, options) {
  // 创建一个响应式effect 数据变化后可以重新执行 只要依赖的属性变化了就要执行回调
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect; // 这样就可以通过runner获取到effect了
  runner(); // 一开始执行一次
  if (options) Object.assign(_effect, options); // 使用用户传递的option覆盖内置的
  return runner; // 返回runner，这样effect执行之后可以接收，然后重新执行
}

function cleanDepEffect(dep, effect) {
  dep.delete(effect);
  if (dep.size === 0) dep.cleanup();
}

// 双向记忆
// dep.set(effect) 同时 effect.deps中包含dep
export function trackEffect(effect, dep) {
  // id相同时，一次性多次访问同一个key会触发多次track，故dep相同时只设置一次
  if (dep.get(effect) === effect._trackId) return;
  dep.set(effect, effect._trackId);

  // 当effect重新触发时_trackId会加一，_depsLength会变为0
  // 这样的话我们的deps中的dep都是按照触发的先后顺序插入deps的，这样就能覆盖上一次id对应的deps
  const oldDep = effect.deps[effect._depsLength];
  if (oldDep !== dep) {
    // 删除掉老的dep
    if (oldDep) cleanDepEffect(oldDep, effect);
    // 换成新的
    effect.deps[effect._depsLength++] = dep;
    // 但是这里还有缺陷，当我们的deps从 a b c d 变成 a e 的时候，这边只能变成 a e c d，c和d无法去除
    // 所以我们到effect的finally中调用postCleanEffect函数进行清除
  } else {
    effect._depsLength++;
  }
}

export function triggerEffects(dep) {
  for (const effect of dep.keys()) {
    if (!effect.scheduler || effect._running) return;
    effect.scheduler();
  }
}
