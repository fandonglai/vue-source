(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('.')) :
  typeof define === 'function' && define.amd ? define(['.'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function isFunction(val) {
    return typeof val === "function";
  }
  function isObject(val) {
    return typeof val == "object" && val != null;
  }

  let oldArrayMethods = Array.prototype;
  // 把原型上的方法拷贝一份
  let arrayMethods = Object.create(Array.prototype);
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
      }
      if (inserted) {
        // 如果有新增的内容需要再次进行劫持
        // 需要观测的是数组中的每一项
        ob.observeArray(inserted);
      }
    };
  });

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
  function observe(data) {
    //   如果是对象 才观测
    if (!isObject(data)) {
      return;
    }
    //   默认data最外层必须是对象
    return new Observer(data);
  }

  // 状态初始化
  function initState(vm) {
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

  // ast语法树 是用对象来描述js语法
  const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 标签名  div
  const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //用来获取标签名 match后的索引为1的

  // let r = "<xxxx></xxxx>".match(new RegExp(qnameCapture));
  // console.log(r);
  const startTagOpen = new RegExp(`^<${qnameCapture}`); //匹配开始标签的
  const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); //匹配闭合标签
  const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //属性 a=b a="b" a='b'
  const startTagClose = /^\s*(\/?)>/; //结尾标签

  // html字符串解析成dom树 <div id="app">123123{{name}}</div>

  // 将解析后的结果 组装成一个树结构 栈

  function createAstElement(tagName, attrs) {
    return {
      tag: tagName,
      type: 1, //标签1 文本3
      children: [],
      parent: null,
      attrs,
    };
  }
  let stack = []; //栈
  // 处理开始标签
  function start(tagName, attributes) {
    let element = createAstElement(tagName, attributes);
    // 每遇到一个开始标签 就放到栈中
    stack.push(element);
  }
  // 处理结束标签
  function end(tagName) {
    let last = stack.pop(); //当遇到标签结束的时候，把最后一项从栈中删除
    if (last.tag !== tagName) {
      throw new Error("标签有误");
    }
  }
  // 处理标签中的文本
  function chars(text) {
    text = text.replace(/\s/g, ""); //把文本中的空格删除
    let parent = (stack = stack[stack.length - 1]); //当前文本的parent为栈中的最后一项
    if (text) {
      // 把文本放在父元素下
      parent.children.push({
        type: 3,
        text,
      });
    }
  }

  function parserHTML(html) {
    function advance(len) {
      html = html.substring(len);
    }
    function parseStartTag() {
      const start = html.match(startTagOpen);
      if (start) {
        const match = {
          tagName: start[1],
          attrs: [],
        };
        advance(start[0].length);
        //   console.log(html); //id="app">{{name}}</div>
        //   循环标签中的属性
        let end;
        //   如果没有遇到标签结尾 就不停的循环解析
        let attr;
        while (
          !(end = html.match(startTagClose)) &&
          (attr = html.match(attribute))
        ) {
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5],
          });
          advance(attr[0].length);
        }
        //   console.log(match);
        if (end) {
          advance(end.length);
        }
        return match;
      }
      return false; //不是开始标签
    }
    while (html) {
      //看要解析的内容是否存在，如果存在就不停的解析
      let textEnd = html.indexOf("<"); //当前解析的开头
      if (textEnd == 0) {
        const startTagMatch = parseStartTag(); //解析开始标签
        if (startTagMatch) {
          // 处理当前的标签名和属性
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }
        const endTagMatch = html.match(endTag);
        if (endTagMatch) {
          end(endTagMatch[1]);
          advance(endTagMatch[0].length);
          continue;
        }
        // break;
      }
      let text; //继续下边的文本 123123</div>
      if (textEnd > 0) {
        text = html.substring(0, textEnd);
      }
      if (text) {
        chars(text); //处理文本
        advance(text.length); //如果文本有值把文本的内容去掉
        // break;
      }
    }
  }
  // 将html解析成ast树 对应的脚本来触发
  function compileTofunction(template) {
    parserHTML(template);
  }

  function initMixin(Vue) {
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

  function Vue(options) {
    // options 用户传入的数据
    this._init(options); //初始化操作，组件
  }
  // 扩展原型
  initMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
