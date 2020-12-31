// ast语法树 是用对象来描述js语法
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 标签名  div
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //用来获取标签名 match后的索引为1的

// let r = "<xxxx></xxxx>".match(new RegExp(qnameCapture));
// console.log(r);
const startTagOpen = new RegExp(`^<${qnameCapture}`); //匹配开始标签的
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); //匹配闭合标签
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //属性 a=b a="b" a='b'
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const startTagClose = /^\s*(\/?)>/; //结尾标签
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //{{name}}

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
let root = null;
let stack = []; //栈
// 处理开始标签
function start(tagName, attributes) {
  let element = createAstElement(tagName, attributes);
  let parent = stack[stack.length - 1];
  if (!root) {
    root = element;
  }
  // 每遇到一个开始标签 就放到栈中
  element.parent = parent; //当放入栈中时 记录父亲是谁
  if (parent) {
    parent.children.push(element);
  }
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
  let parent = stack[stack.length - 1]; //当前文本的parent为栈中的最后一项
  if (text) {
    // 把文本放在父元素下
    parent.children.push({
      type: 3,
      text,
    });
  }
}

export function parserHTML(html) {
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
  function parseEndTag() {}
  while (html) {
    //看要解析的内容是否存在，如果存在就不停的解析
    let textEnd = html.indexOf("<"); //当前解析的开头
    if (textEnd == 0) {
      const startTagMatch = parseStartTag(html); //解析开始标签
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
  return root;
}
