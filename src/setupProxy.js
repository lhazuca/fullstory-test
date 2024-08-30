const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    ["/api", "/oauth"],
    createProxyMiddleware({
      target: process.env.PROXY,
      changeOrigin: true,
    }),
  );
};
