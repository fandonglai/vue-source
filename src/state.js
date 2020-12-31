import { isFunction } from "./util";
import { observe } from "./observe/index";
// 状态初始化
export function initState(vm) {
  //状态的初始化
  const opts = vm.$options;
  if (opts.props) {
    initProps(vm);
  }
  if (opts.data) {
    initData(vm);
  }
  if (opts.computed) {
    initComputed(vm);
  }
}
// 代理 用户去vm上取值时 相当于vm._data上取值
function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key];
    },
    set(newValue) {
      vm[source][key] = newValue;
    },
  });
}
function initData(vm) {
  let data = vm.$options.data;
  //   Vue2中会将data中的数据 进行数据劫持 Object.defineProperty
  data = vm._data = isFunction(data) ? data.call(vm) : data;
  for (let key in data) {
    //vm.name = vm._data.name
    proxy(vm, "_data", key);
  }
  observe(data);
}
