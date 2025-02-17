const typescript = require("rollup-plugin-typescript2");
const resolve = require("@rollup/plugin-node-resolve");

module.exports = {
  input: "src/index.ts",
  output: [
    {
      file: "dist/quickbytes-webpay.js",
      format: "umd",
      name: "QuickBytes"
    },
    {
      file: "dist/quickbytes-webpay.esm.js",
      format: "es"
    }
  ],
  plugins: [
    resolve(),
    typescript({
      typescript: require("typescript"),
      useTsconfigDeclarationDir: true
    })
  ]
}
