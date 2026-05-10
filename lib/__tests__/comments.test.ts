import { describe, it, expect, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('../firebaseAdmin', () => ({
  db: {
    collection: () => ({
      doc: () => ({
        get: vi.fn(async () => ({ exists: false, data: () => null })),
        set: vi.fn(async () => {}),
      }),
      where: () => ({
        orderBy: () => ({
          get: vi.fn(async () => ({ docs: [] })),
        }),
        get: vi.fn(async () => ({ docs: [] })),
      }),
    }),
    batch: () => ({
      delete: vi.fn(),
      commit: vi.fn(async () => {}),
    }),
  },
}))

// ── Validation Edge Cases ──

describe('validateComment — boundary edge cases', () => {
  it('accepts exactly 4-character password as valid', async () => {
    const { validateComment } = await import('../comments')
    const result = validateComment({ nickname: 'user', password: 'abcd', content: 'hello' })
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('rejects 3-character password as invalid', async () => {
    const { validateComment } = await import('../comments')
    const result = validateComment({ nickname: 'user', password: 'abc', content: 'hello' })
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('accepts exactly 30-character nickname as valid', async () => {
    const { validateComment } = await import('../comments')
    const nickname = 'a'.repeat(30)
    const result = validateComment({ nickname, password: 'pass', content: 'hello' })
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('rejects 31-character nickname as invalid', async () => {
    const { validateComment } = await import('../comments')
    const nickname = 'a'.repeat(31)
    const result = validateComment({ nickname, password: 'pass', content: 'hello' })
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('accepts exactly 1000-character content as valid', async () => {
    const { validateComment } = await import('../comments')
    const content = 'x'.repeat(1000)
    const result = validateComment({ nickname: 'user', password: 'pass', content })
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('rejects 1001-character content as invalid', async () => {
    const { validateComment } = await import('../comments')
    const content = 'x'.repeat(1001)
    const result = validateComment({ nickname: 'user', password: 'pass', content })
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })
})

// ── HTML Sanitization ──

describe('sanitizeHtml — mixed content strings', () => {
  it('escapes script tags in XSS attempt', async () => {
    const { sanitizeHtml } = await import('../comments')
    const input = '<script>alert("xss")</script>'
    const output = sanitizeHtml(input)
    expect(output).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
    expect(output).not.toContain('<script>')
    expect(output).not.toContain('</script>')
  })

  it('escapes all five HTML special characters', async () => {
    const { sanitizeHtml } = await import('../comments')
    const input = `Tom & Jerry <b>"bold"</b> it's`
    const output = sanitizeHtml(input)
    expect(output).toBe(`Tom &amp; Jerry &lt;b&gt;&quot;bold&quot;&lt;/b&gt; it&#39;s`)
  })

  it('returns plain text unchanged', async () => {
    const { sanitizeHtml } = await import('../comments')
    const input = 'Hello world 123'
    const output = sanitizeHtml(input)
    expect(output).toBe(input)
  })

  it('handles empty string', async () => {
    const { sanitizeHtml } = await import('../comments')
    expect(sanitizeHtml('')).toBe('')
  })

  it('escapes multiple ampersands correctly', async () => {
    const { sanitizeHtml } = await import('../comments')
    const input = 'a & b & c'
    const output = sanitizeHtml(input)
    expect(output).toBe('a &amp; b &amp; c')
  })
})

// ── Password Hashing ──

describe('hashPassword / verifyPassword — known inputs', () => {
  it('verifies correct password returns true', async () => {
    const { hashPassword, verifyPassword } = await import('../comments')
    const password = 'mySecret123'
    const hash = await hashPassword(password)
    const result = await verifyPassword(password, hash)
    expect(result).toBe(true)
  })

  it('verifies wrong password returns false', async () => {
    const { hashPassword, verifyPassword } = await import('../comments')
    const hash = await hashPassword('correctPassword')
    const result = await verifyPassword('wrongPassword', hash)
    expect(result).toBe(false)
  })

  it('produces hash in salt:hash format', async () => {
    const { hashPassword } = await import('../comments')
    const hash = await hashPassword('test1234')
    expect(hash).toContain(':')
    const [salt, hashPart] = hash.split(':')
    expect(salt.length).toBe(32) // 16 bytes = 32 hex chars
    expect(hashPart.length).toBe(64) // SHA-256 = 32 bytes = 64 hex chars
  })

  it('generates different hashes for the same password (random salt)', async () => {
    const { hashPassword } = await import('../comments')
    const hash1 = await hashPassword('samePassword')
    const hash2 = await hashPassword('samePassword')
    expect(hash1).not.toBe(hash2)
  })

  it('returns false for malformed hash (no colon separator)', async () => {
    const { verifyPassword } = await import('../comments')
    const result = await verifyPassword('password', 'invalidhashwithoutcolon')
    expect(result).toBe(false)
  })
})

// ── Email Validation ──

describe('validateEmail — valid and invalid formats', () => {
  it('accepts standard email format', async () => {
    const { validateEmail } = await import('../comments')
    expect(validateEmail('user@example.com')).toBe(true)
  })

  it('accepts email with subdomain', async () => {
    const { validateEmail } = await import('../comments')
    expect(validateEmail('user@mail.example.co.kr')).toBe(true)
  })

  it('accepts email with plus sign in local part', async () => {
    const { validateEmail } = await import('../comments')
    expect(validateEmail('user+tag@example.com')).toBe(true)
  })

  it('accepts email with dots in local part', async () => {
    const { validateEmail } = await import('../comments')
    expect(validateEmail('first.last@example.com')).toBe(true)
  })

  it('rejects email without @ symbol', async () => {
    const { validateEmail } = await import('../comments')
    expect(validateEmail('userexample.com')).toBe(false)
  })

  it('rejects email with multiple @ symbols', async () => {
    const { validateEmail } = await import('../comments')
    expect(validateEmail('user@@example.com')).toBe(false)
  })

  it('rejects email with empty local part', async () => {
    const { validateEmail } = await import('../comments')
    expect(validateEmail('@example.com')).toBe(false)
  })

  it('rejects email with no dot in domain', async () => {
    const { validateEmail } = await import('../comments')
    expect(validateEmail('user@localhost')).toBe(false)
  })

  it('rejects email with empty domain', async () => {
    const { validateEmail } = await import('../comments')
    expect(validateEmail('user@')).toBe(false)
  })

  it('rejects email with trailing dot in domain', async () => {
    const { validateEmail } = await import('../comments')
    expect(validateEmail('user@example.')).toBe(false)
  })

  it('rejects email with leading dot in domain', async () => {
    const { validateEmail } = await import('../comments')
    expect(validateEmail('user@.example.com')).toBe(false)
  })
})
