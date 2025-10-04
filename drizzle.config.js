module.exports = {
  schema: './src/infrastructure/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: 'localhost',
    port: 5432,
    user: 'clothes_user',
    password: 'clothes_pass',
    database: 'clothes_db',
    ssl: false,
  },
};