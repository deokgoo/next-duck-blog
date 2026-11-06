import 'server-only'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { db } from './firebaseAdmin'

// ── 유효성 검증 ──

/**
 * Post slug 유효성 검증
 * 비어있지 않은 문자열인지 확인한다.
 */
export function validateSlug(slug: unknown): boolean {
  if (typeof slug !== 'string') return false
  return slug.trim().length > 0
}

// ── 좋아요 증가 ──

/**
 * 포스트의 좋아요 수를 1 증가시킨다.
 * 문서가 존재하지 않으면 자동으로 생성한다 (merge: true).
 * 증가 후 현재 좋아요 수를 반환한다.
 */
export async function incrementLikes(slug: string): Promise<number> {
  const docRef = db.collection('post-engagement').doc(slug)

  await docRef.set(
    {
      likes: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  )

  const snapshot = await docRef.get()
  const data = snapshot.data()
  return data?.likes ?? 0
}

// ── 통계 조회 ──

/**
 * 여러 포스트의 engagement 통계를 배치로 조회한다.
 * Firestore getAll()을 사용하여 한 번의 호출로 다수 문서를 읽는다.
 * 존재하지 않는 문서는 { likes: 0 }을 기본값으로 반환한다.
 */
export async function getEngagementStats(
  slugs: string[]
): Promise<Record<string, { likes: number }>> {
  if (slugs.length === 0) {
    return {}
  }

  const docRefs = slugs.map((slug) => db.collection('post-engagement').doc(slug))
  const snapshots = await db.getAll(...docRefs)

  const result: Record<string, { likes: number }> = {}

  for (let i = 0; i < slugs.length; i++) {
    const snapshot = snapshots[i]
    if (snapshot.exists) {
      const data = snapshot.data()
      const likes = data?.likes ?? 0
      result[slugs[i]] = { likes }
    } else {
      result[slugs[i]] = { likes: 0 }
    }
  }

  return result
}

// ── Rate Limiting ──

/**
 * IP 기반 rate limit을 확인한다.
 * 24시간 내 동일 IP/slug/action 조합의 요청이 있으면 false를 반환한다.
 * 첫 요청이거나 만료된 경우 새 엔트리를 생성하고 true를 반환한다.
 *
 * @returns true = 요청 허용 (첫 요청 또는 만료됨), false = rate limited (24시간 이내)
 */
export async function checkRateLimit(ip: string, slug: string, action: 'like'): Promise<boolean> {
  const docId = `${ip}_${slug}_${action}`
  const docRef = db.collection('rate-limits').doc(docId)

  const snapshot = await docRef.get()

  if (snapshot.exists) {
    const data = snapshot.data()
    const expiresAt = data?.expiresAt as Timestamp | undefined

    if (expiresAt && expiresAt.toDate().getTime() > Date.now()) {
      // Rate limited: entry exists and hasn't expired
      return false
    }
  }

  // First request or expired: create/overwrite the rate limit entry
  await docRef.set({
    ip,
    slug,
    action,
    timestamp: FieldValue.serverTimestamp(),
    expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
  })

  return true
}

/**
 * 검색 요청 IP 기반 rate limit 확인 (슬라이딩 윈도우 방식)
 * 60초 내 동일 IP에서 최대 30개 요청 허용
 * 만료된 타임스탬프는 자동 정리
 */
export async function checkSearchRateLimit(ip: string): Promise<{ allowed: boolean }> {
  // Firestore 미 초기화 환경(로컬 등)에서는 제한을 건너뜀
  if (!db) return { allowed: true }

  const docRef = db.collection('search-rate-limits').doc(ip)
  const now = Date.now()
  const windowMs = 60 * 1000 // 60초
  const maxRequests = 30

  const snapshot = await docRef.get()

  let timestamps: number[] = []

  if (snapshot.exists) {
    const data = snapshot.data()
    timestamps = data?.timestamps ?? []
  }

  // 윈도우 밖의 만료된 타임스탬프 제거
  const validTimestamps = timestamps.filter((ts) => now - ts < windowMs)

  // 윈도우 내 요청이 30개 이상이면 거부
  if (validTimestamps.length >= maxRequests) {
    // 만료된 타임스탬프가 있었다면 정리하여 저장
    if (validTimestamps.length !== timestamps.length) {
      await docRef.set({
        ip,
        timestamps: validTimestamps,
        updatedAt: new Date().toISOString(),
      })
    }
    return { allowed: false }
  }

  // 현재 타임스탬프 추가 후 저장
  validTimestamps.push(now)
  await docRef.set({
    ip,
    timestamps: validTimestamps,
    updatedAt: new Date().toISOString(),
  })

  return { allowed: true }
}
