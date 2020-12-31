import { parserHTML } from "./parser";
// 将html解析成ast树 对应的脚本来触发
export function compileTofunction(template) {
  let root = parserHTML(template);
  console.log(root);
  // html=》ast=》render函数是虚拟（增加一些额外的属性）=》生成真是dom
  // 把ast树转为render
}
