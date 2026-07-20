import logging
import json
import traceback
from datetime import datetime, timezone

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "path": record.pathname,
            "line": record.lineno,
        }
        if record.exc_info:
            log_record["exception"] = "".join(traceback.format_exception(*record.exc_info))
        return json.dumps(log_record)

def setup_logging():
    logger = logging.getLogger("mitra_verify")
    logger.setLevel(logging.INFO)
    
    # Avoid duplicate logs if setup_logging is called multiple times
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)
        
    return logger

logger = setup_logging()
