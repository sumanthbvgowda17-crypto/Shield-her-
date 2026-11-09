const logger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    
    // Color coding based on status code
    let statusColor = '\x1b[32m'; // Green for 200s
    if (res.statusCode >= 400) statusColor = '\x1b[33m'; // Yellow for 400s
    if (res.statusCode >= 500) statusColor = '\x1b[31m'; // Red for 500s
    const resetColor = '\x1b[0m';
    
    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} ${statusColor}${res.statusCode}${resetColor} - ${duration}ms`
    );
  });
  
  next();
};

module.exports = logger;
