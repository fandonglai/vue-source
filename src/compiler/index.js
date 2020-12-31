import { parserHTML } from "./parser";
import { generate } from "./gernerate";
// 将html解析成ast树 对应的脚本来触发
export function compileTofunction(template) {
  let root = parserHTML(template);

  // 生成代码---------
  let code = generate(root);

  // render(){
  //   return _c('div',{id:'app',a:1},'hello')
  // }
  // {tag:'div',data:{id:'app',a:1},children:[{text:'hello'}]}

  // html=》ast=》render函数是虚拟（增加一些额外的属性）=》生成真是dom
  // 把ast树转为render
}
