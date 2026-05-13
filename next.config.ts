import type { NextConfig } from 'next'
import { execSync } from 'child_process'

const gitVersion = (() => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'unknown'
  }
})()

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GIT_VERSION: gitVersion,
  },
  output: 'export',
}

export default nextConfig
