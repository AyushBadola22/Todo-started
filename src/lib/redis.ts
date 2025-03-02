import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");
console.log('running')
redis.on("connect", () => console.log("Connected to Redis"));
redis.on("error", (err) => console.error("❌ Redis Error:", err));

export default redis;
