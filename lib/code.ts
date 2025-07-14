const resetCodes = new Map<string, { code: string, expires: number }>()

export function generateResetCode() {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export async function storeResetCode(email: string, code: string) {
  resetCodes.set(email, { code, expires: Date.now() + 10 * 60 * 1000 }) // 10 mins
}

export async function verifyResetCode(email: string, code: string) {
  const entry = resetCodes.get(email)
  if (!entry) return false
  const isValid = entry.code === code && Date.now() < entry.expires
  return isValid
}

export async function clearResetCode(email: string) {
  resetCodes.delete(email)
}
