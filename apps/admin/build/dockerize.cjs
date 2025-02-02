const fs = require('fs')
const { execSync } = require('child_process')

const packageName = process.env.npm_package_name.replace('@', '')
const packageVersion = process.env.npm_package_version
const distDir = 'dist'
const entrypoint = 'server.js'
const imageName = `${packageName}:${packageVersion}`

const dockerPath = 'node_modules/.docker'
const dockerfilePath = `${dockerPath}/Dockerfile`

const dockerfile = `
FROM node:lts-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
RUN corepack enable
WORKDIR /app
COPY package.json ./

FROM base AS prod-deps
RUN npm config set registry ${process.env.npm_config_registry}
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod

FROM prod-deps AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
COPY . .
RUN pnpm build:client --  --outDir ${distDir}/client
RUN pnpm build:server --  --outDir ${distDir}/server

FROM base AS runtime
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/${distDir} ./${distDir}
COPY ${entrypoint} ./${entrypoint}
ENTRYPOINT ["node", "./${entrypoint}"]
EXPOSE 5173
`.trim()

if (!fs.existsSync(dockerPath)) {
  fs.mkdirSync(dockerPath)
}
fs.writeFileSync(dockerfilePath, dockerfile)

const dockerBuildCmd = `docker build -t ${imageName} -f ${dockerfilePath} .`
console.log(dockerBuildCmd)
execSync(dockerBuildCmd, { stdio: 'inherit' })