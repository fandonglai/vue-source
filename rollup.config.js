import serve from "rollup-plugin-serve";
import babel from "rollup-plugin-babel";
export default {
  input: "./src/index.js",
  output: {
    format: "umd", //支持amd和commonjs规范 window.Vue
    name: "Vue",
    file: "dist/vue.js",
    sourcemap: true, //打包出来的是es5代码 可以支持es6源代码
  },
  plugin: [
    babel({
      // 使用babel进行转化 但是排除node_modules文件
      exclude: "node_modules/**",
    }),
    serve({
      open: true,
      openPage: "/public/oindex.html",
      port: 3000,
      contentBase: "",
    }),
  ],
};
