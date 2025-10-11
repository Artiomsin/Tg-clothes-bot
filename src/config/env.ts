import { config } from 'dotenv';
config();

export const env = {
  DB_HOST: process.env.DB_HOST ?? 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT ?? '5432', 10),
  DB_USER: process.env.DB_USER ?? 'clothes_user',
  DB_PASS: process.env.DB_PASS ?? 'clothes_pass',
  DB_NAME: process.env.DB_NAME ?? 'clothes_db',
  DB_SSL: process.env.DB_SSL === 'true',

  DRIZZLE_DATABASE_URL: process.env.DRIZZLE_DATABASE_URL ?? '',

  BOT_TOKEN: process.env.BOT_TOKEN ?? '',
};
