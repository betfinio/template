# --- build stage ---
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || bun install
COPY . .
RUN bun run build

# --- run stage ---
FROM oven/bun:1
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/package.json ./package.json
ENV PORT=5200
EXPOSE 5200
# Serves dist/ with the CORS + cache headers a federation host needs.
CMD ["bun", "scripts/serve.ts"]
