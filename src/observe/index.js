import { isObject } from "../util";
import { arrayMethods } from "./array";
// 监测数据变化 类有类型 对象无类型
class Observer {
  constructor(data) {
    Object.defineProperty(data, "__ob__", {
      value: this,
      enumerable: false,
    });
    // data.__ob__ = this; //所有被劫持的属性都有__ob__
    if (Array.isArray(data)) {
      // 数据劫持的逻辑
      //  对数组方法进行改写，切片变成
      data.__proto__ = arrayMethods;
      //   如果数组中的数据是对象类型，需要监控对象的变化
      this.observeArray(data);
    } else {
      //对对象中的所有属性进行劫持
      this.walk(data);
    }
  }
  observeArray(data) {
    data.forEach((item) => {
      observe(item);
    });
  }
  walk(data) {
    Object.keys(data).forEach((key) => {
      defineReactive(data, key, data[key]);
    });
  }
}
// vue2会对对象进行遍历，将每个属性用defineProperty重新定义 性能差
function defineReactive(data, key, value) {
  // value有可能是对象
  observe(value); //本身数据默认值是对象套对象，需要递归处理（性能差）
  Object.defineProperty(data, key, {
    get() {
      return value;
    },
    set(newV) {
      observe(newV); // 如果用户赋值一个新对象，需要将这个对象进行劫持
      value = newV;
    },
  });
}
export function observe(data) {
  //   如果是对象 才观测
  if (!isObject(data)) {
    return;
  }
  //   默认data最外层必须是对象
  return new Observer(data);
}
