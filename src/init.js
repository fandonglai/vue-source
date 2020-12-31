import { initState } from "./state";
import { compileTofunction } from "./compiler/index";
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options;
    // 对数据进行初始化
    initState(vm);

    if (vm.$options.el) {
      // 将数据挂载到这个模版上
      vm.$mount(vm.$options.el);
    }
  };
  Vue.prototype.$mount = function (el) {
    const vm = this;
    const options = vm.$options;
    el = document.querySelector(el);
    // console.log(el);
    // 把模板转换成对应的渲染函数=》虚拟dom vnode =》diff算法
    // 更新虚拟节点=》产生真是节点，更新
    if (!options.render) {
      //没有render用template
      let template = options.template;
      if (!template && el) {
        //用户也没有传递template
        template = el.outerHTML;
        let render = compileTofunction(template);
        options.render = render;
      }
    }
    // options.render 就是渲染函数
  };
}
