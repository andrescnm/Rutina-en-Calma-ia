const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000");
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX || "30");

// Token bucket implementation
class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number;

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  consume(): boolean {
    this.refill();
    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    return false;
  }

  private refill() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = (timePassed / 1000) * (this.refillRate / 60);
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

// In-memory store for rate limiting
const buckets = new Map<string, TokenBucket>();

export function rateLimit(req: any, res: any, next: any) {
  const identifier = req.ip || req.connection.remoteAddress || "anonymous";
  
  let bucket = buckets.get(identifier);
  if (!bucket) {
    bucket = new TokenBucket(MAX_REQUESTS, MAX_REQUESTS);
    buckets.set(identifier, bucket);
  }

  if (bucket.consume()) {
    next();
  } else {
    res.status(429).json({
      error: "Too many requests",
      retryAfter: Math.ceil(WINDOW_MS / 1000)
    });
  }
}
