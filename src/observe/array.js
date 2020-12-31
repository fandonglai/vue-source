import { observe } from ".";

let oldArrayMethods = Array.prototype;
// 把原型上的方法拷贝一份
export let arrayMethods = Object.create(Array.prototype);
// arrayMethods.__proto__ = Array.prototype  继承
let methods = ["push", "shift", "unshift", "pop", "reverse", "sort", "splice"];
methods.forEach((method) => {
  arrayMethods[method] = function (...args) {
    //args是参数列表
    console.log("数组发生变化");
    oldArrayMethods[method].call(this, ...args);
    let inserted;
    let obj = this.__ob__; //根据当前数组获取obersveArray方法
    switch (method) {
      case "push":
      case "unshift":
        inserted = args; //就是新增的内容
        break;
      case "splice":
        inserted = args.slice(2); //参数中的第三项及以后的是新增的内容 splice（0,2,1,1,1,1,1）
      default:
        break;
    }
    if (inserted) {
      // 如果有新增的内容需要再次进行劫持
      // 需要观测的是数组中的每一项
      ob.observeArray(inserted);
    }
  };
});
