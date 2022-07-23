import _log from "@ezarcel/log";
import { padding } from "@ezarcel/tools";

import type { RequestHandler } from "express";
import { performance as perf } from "perf_hooks";

const _perf = _log("Performance");
const _ = _log();

export const performance: (msWarn?: number) => RequestHandler =
  (msWarn = 12.5) =>
  (req, res, next) => {
    const startTime = perf.now();
    next();
    const duration = perf.now() - startTime;
    if (duration > msWarn)
      _perf().warn(
        `A ${req.method} request to "${req.path}" took ${
          Math.round(duration * 100) / 100
        }ms`
      );
  };

export const log: RequestHandler = (req, res, next) => {
  const _ip = padding(req.ip.replace("::ffff:", "").replace("::1", ""), {
    alignment: "left",
    length: 15,
  });
  const method = padding(req.method, { alignment: "left", length: 7 });
  const urlParamsLength = [...req.urlParams.entries()].length;
  _("📥").verbose(
    `${_ip} ${method} ${req.path}${
      urlParamsLength
        ? ` (${urlParamsLength} parameter${urlParamsLength > 1 ? "s" : ""})`
        : ""
    }`
  );

  next();
};

declare global {
  namespace Express {
    interface Request {
      urlParams: URLSearchParams;
    }
  }
}
export const URLParams: RequestHandler = (req, res, next) => {
  req.urlParams = new URLSearchParams(
    req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : {}
  );
  next();
};
