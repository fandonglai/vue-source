import { initMixin } from "./init";
function Vue(options) {
  // options 用户传入的数据
  this._init(options); //初始化操作，组件
}
// 扩展原型
initMixin(Vue);

export default Vue;
