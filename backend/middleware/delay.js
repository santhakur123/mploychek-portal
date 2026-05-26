/**
 * Delay Middleware to simulate network latency
 * Checks query parameter, body, or custom header for a delay value in milliseconds.
 */
module.exports = (req, res, next) => {
  const delayParam = req.query.delay || req.body.delay || req.headers['x-api-delay'];
  const delayMs = parseInt(delayParam, 10);

  if (!isNaN(delayMs) && delayMs > 0) {
    // Limit maximum delay to 10 seconds to prevent absolute hangs
    const safeDelay = Math.min(delayMs, 10000);
    setTimeout(() => {
      next();
    }, safeDelay);
  } else {
    next();
  }
};
