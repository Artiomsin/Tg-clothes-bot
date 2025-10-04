export default {
  schema: "./src/infrastructure/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    host: "localhost",
    port: 5432,
    user: "user",
    password: "pass",
    database: "clothes",
  },
};
