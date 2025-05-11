declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB_URI: string;
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    API_KEY: string;
    REDIS_URL: string;
    STABILITY_API_KEY?: string;
    LOG_LEVEL?: string;
    GOOGLE_CLOUD_PROJECT?: string;
    GOOGLE_CLOUD_LOCATION?: string;
    OPENAI_API_KEY?: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
