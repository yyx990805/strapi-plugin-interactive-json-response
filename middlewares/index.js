"use strict";

const pluginName = require('../admin/src/pluginId')

const PLUGIN_NAME = pluginName;
const UPLOAD_PATH = "/uploads/(.*)";

/**
 *
 * @param {*} options
 * @param {{ strapi: import('@strapi/strapi').Strapi }}
 */
const middlewareJson = (options, { strapi }) => {
  const maxAge = options.maxAge == null
  ? 86400000
  : Math.min(Math.max(0, options.maxAge), 31556926000);
  const cacheControl = `public, max-age=${maxAge / 1000 | 0}`;

 return async (/** @type {ReturnType<import('@strapi/strapi').Application.createContext>} */ctx, next) => {
    const start = Date.now();
    const o2 = options.replaceAllHtmlRequests && ctx.req.headers.accept.includes('text/html');
    if (ctx.path.includes('api') && (ctx.req.headers.accept.startsWith('text/html') || o2)) {
      ctx.set('Cache-Control', cacheControl);
      ctx.type = 'text/html';
      ctx.res.setHeader('content-type', 'text/html');
      // ctx.set('content-type', ctx.type);
      await next();
      ctx.body = `test=${ctx.body}`;
      ctx.res.setHeader('content-type', 'text/html');
      ctx.set('Content-Type', 'text/html');
      ctx.response.header['content-type'] = 'text/html';
      return;
    }
    await next();
    const delta = Math.ceil(Date.now() - start);

    strapi.log.http(`${ctx.method} ${ctx.url} (${delta} ms) ${ctx.status}`);
  };
};

/**
 *
 * @param {*} options
 * @param {{ strapi: import('@strapi/strapi').Strapi }}
 */
const middlewareJson2 = (op, {strapi}) => {
  const debug = (msg) => strapi.log.debug(`[${PLUGIN_NAME}] ${msg}`);

  debug("Initializing ...");

  const options = strapi.config.get(`plugin.${PLUGIN_NAME}`, {});

  const dynamic = !!options.dynamic;
  const files = dynamic ? new LRU(options.lruOptions) : {};

  debug(
    `Middleware initialized for endpoint='${UPLOAD_PATH}' [maxAge=${options.maxAge}]`
  );

  const publicDir =
    typeof strapi.dirs.static === "object"
      ? strapi.dirs.static.public // Strapi 4.3+
      : strapi.dirs.public; // Strapi < 4.3

  strapi.api

  if (0) strapi.server.routes([
    {
      method: "GET",
      path: UPLOAD_PATH,
      handler: [range, staticCache(publicDir, { ...options, files })],
      config: { auth: false },
    },
  ]);
}

/**
 * Creates the middleware for strapi
 * @param {{ strapi: import('@strapi/strapi').Strapi }}
 */
module.exports = {
  middlewareJson,
  middlewareJson2,
};
