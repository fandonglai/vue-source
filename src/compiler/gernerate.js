// html字符串 转为字符串
// 拼接attrs属性
function genProps(attrs) {
  let str = "";
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    if (attr.name === "style") {
      // style:"width: 100px; color: red"
      let styleObj = {};
      attr.value.replace(/([^;:]+)\:([^;:]+)/g, function () {
        styleObj[arguments[1]] = arguments[2];
      });
      attr.value = styleObj;
    }
    // JSON.stringify 为了有双引号
    str += `${attr.name}:${JSON.stringify(attr.value)},`;
  }
  return `{${str.slice(0, -1)}}`;
}
function gen(el) {
  console.log(el, 11);
  if (el.type == 1) {
    return generate(el);
  } else {
    let text = el.text;
    return `_v('${text}')`;
  }
}
function genChildren(el) {
  let children = el.children;
  if (children) {
    return children
      .map((c) => {
        gen(c);
      })
      .join(",");
  }
  return false;
}
export function generate(el) {
  console.log("---", el);

  //   遍历树 将树生成字符串
  //   字符串拼接
  let children = genChildren(el);
  let code = `_c('${el.tag}',${
    el.attrs.length ? genProps(el.attrs) : "undefined"
  }${children ? `,${children}` : ""})`;

  console.log(code, "===");
}
