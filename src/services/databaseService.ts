import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { format } from 'date-fns'
import { db } from '../lib/firebase'
import { compressToDataUrl } from '../lib/image'
import { roleLabel, type UserRole } from '../lib/types'
import type {
  EventDoc,
  ExperienceDoc,
  TranscriptRequest,
  TranscriptStatus,
  UserModel,
} from '../lib/types'
import { userFromFirestore } from '../lib/types'

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate()
  if (value instanceof Date) return value
  return null
}

function mapEvent(id: string, data: Record<string, unknown>): EventDoc {
  return {
    id,
    title: String(data.title ?? 'Untitled Event'),
    description: String(data.description ?? ''),
    date: toDate(data.date),
    location: String(data.location ?? ''),
    organizer: String(data.organizer ?? ''),
    department: data.department != null ? String(data.department) : undefined,
    createdAt: toDate(data.createdAt),
  }
}

/** Every signed-in user receives the full events collection, not only their own posts. */
export function subscribeEvents(callback: (events: EventDoc[]) => void): Unsubscribe {
  const col = collection(db, 'events')
  let stopFallback: Unsubscribe | null = null
  const stopOrdered = onSnapshot(
    query(col, orderBy('createdAt', 'desc')),
    (snap) => callback(snap.docs.map((d) => mapEvent(d.id, d.data()))),
    () => {
      stopFallback = onSnapshot(col, (snap) => {
        const events = snap.docs.map((d) => mapEvent(d.id, d.data()))
        events.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
        callback(events)
      })
    },
  )
  return () => {
    stopOrdered()
    stopFallback?.()
  }
}

export function subscribeEventRegistration(
  eventId: string,
  uid: string,
  callback: (registered: boolean) => void,
): Unsubscribe {
  return onSnapshot(doc(db, 'events', eventId, 'registrations', uid), (snap) => {
    callback(snap.exists())
  })
}

export async function registerForEvent(params: {
  eventId: string
  uid: string
  name: string
  email: string
}): Promise<void> {
  await setDoc(doc(db, 'events', params.eventId, 'registrations', params.uid), {
    uid: params.uid,
    name: params.name,
    email: params.email,
    registeredAt: serverTimestamp(),
  })
}

export async function createEvent(data: {
  title: string
  description: string
  date: Date
  location: string
  organizer: 'SSD' | 'Department'
  department?: string
}): Promise<void> {
  await addDoc(collection(db, 'events'), {
    title: data.title,
    description: data.description,
    date: Timestamp.fromDate(data.date),
    location: data.location,
    organizer: data.organizer,
    ...(data.department ? { department: data.department } : {}),
    createdAt: serverTimestamp(),
  })
}

export async function createTranscriptRequest(data: {
  alumniId: string
  alumniName: string
  sapId: string
  documentType: string
  registrationNo: string
}): Promise<void> {
  await addDoc(collection(db, 'transcript_requests'), {
    alumniId: data.alumniId,
    alumniName: data.alumniName,
    sapId: data.sapId,
    'sap id': data.sapId,
    documentType: data.documentType,
    registrationNo: data.registrationNo,
    status: 'Pending',
    createdAt: serverTimestamp(),
  })
}

export function subscribeAlumniTranscriptRequests(
  alumniId: string,
  callback: (requests: TranscriptRequest[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'transcript_requests'),
    where('alumniId', '==', alumniId),
  )
  return onSnapshot(q, (snap) => {
    callback(mapTranscriptDocs(snap.docs))
  })
}

export function subscribePendingTranscriptRequests(
  callback: (requests: TranscriptRequest[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'transcript_requests'),
    where('status', '==', 'Pending'),
  )
  return onSnapshot(q, (snap) => {
    callback(mapTranscriptDocs(snap.docs))
  })
}

export function subscribeAllTranscriptRequests(
  callback: (requests: TranscriptRequest[]) => void,
): Unsubscribe {
  const q = query(collection(db, 'transcript_requests'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    callback(mapTranscriptDocs(snap.docs))
  })
}

function mapTranscriptDocs(
  docs: { id: string; data: () => Record<string, unknown> }[],
): TranscriptRequest[] {
  return docs.map((d) => {
    const data = d.data()
    const status = String(data.status ?? 'Pending') as TranscriptStatus
    return {
      id: d.id,
      alumniId: String(data.alumniId ?? ''),
      alumniName: String(data.alumniName ?? ''),
      sapId: String(data.sapId ?? data['sap id'] ?? ''),
      documentType: String(data.documentType ?? 'Transcript'),
      registrationNo: String(data.registrationNo ?? ''),
      status: status === 'Approved' || status === 'Rejected' ? status : 'Pending',
      reason: data.reason != null ? String(data.reason) : undefined,
      createdAt: toDate(data.createdAt),
    }
  })
}

export async function updateTranscriptStatus(
  id: string,
  status: TranscriptStatus,
  reviewer: { name: string; role: UserRole },
  note?: string,
): Promise<void> {
  const action = status === 'Approved' ? 'Approved' : status === 'Rejected' ? 'Rejected' : status
  const who = reviewer.name.trim() || 'Staff'
  const when = format(new Date(), 'd MMM yyyy')
  const lines = [
    `${action} by: ${who}`,
    `Role: ${roleLabel(reviewer.role)}`,
    `Date: ${when}`,
  ]
  if (note?.trim()) lines.push(`Note: ${note.trim()}`)
  await updateDoc(doc(db, 'transcript_requests', id), {
    status,
    reason: lines.join('\n'),
  })
}

function mapExperience(id: string, data: Record<string, unknown>): ExperienceDoc {
  return {
    id,
    authorId: String(data.authorId ?? ''),
    author: String(data.author ?? 'Alumni'),
    classInfo: String(data.classInfo ?? ''),
    title: String(data.title ?? ''),
    content: String(data.content ?? ''),
    imageUrl: data.imageUrl != null ? String(data.imageUrl) : undefined,
    avatarUrl: data.avatarUrl != null ? String(data.avatarUrl) : undefined,
    likes: Number(data.likes ?? 0),
    comments: Number(data.comments ?? 0),
    createdAt: toDate(data.createdAt),
  }
}

/** Every signed-in alumni sees every experience, career, and update. */
export function subscribeExperiences(
  callback: (items: ExperienceDoc[]) => void,
): Unsubscribe {
  const col = collection(db, 'experiences')
  let stopFallback: Unsubscribe | null = null
  const stopOrdered = onSnapshot(
    query(col, orderBy('createdAt', 'desc')),
    (snap) => callback(snap.docs.map((d) => mapExperience(d.id, d.data()))),
    () => {
      stopFallback = onSnapshot(col, (snap) => {
        const items = snap.docs.map((d) => mapExperience(d.id, d.data()))
        items.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
        callback(items)
      })
    },
  )
  return () => {
    stopOrdered()
    stopFallback?.()
  }
}

export async function createExperience(data: {
  authorId: string
  author: string
  classInfo: string
  title: string
  content: string
  imageUrl?: string
  avatarUrl?: string
}): Promise<void> {
  await addDoc(collection(db, 'experiences'), {
    authorId: data.authorId,
    author: data.author,
    classInfo: data.classInfo,
    title: data.title,
    content: data.content,
    ...(data.imageUrl ? { imageUrl: data.imageUrl } : {}),
    ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
    likes: 0,
    comments: 0,
    createdAt: serverTimestamp(),
  })
}

/** Compressed JPEG saved on the user document. Does not use Cloud Storage. */
export async function uploadProfileImage(uid: string, file: File): Promise<string> {
  if (!uid) throw new Error('You must be signed in to save a photo.')
  return compressToDataUrl(file, { maxSide: 320, maxChars: 3800 })
}

/** Compressed JPEG saved on the experience document. Does not use Cloud Storage. */
export async function uploadExperienceImage(uid: string, file: File): Promise<string> {
  if (!uid) throw new Error('You must be signed in to save a photo.')
  return compressToDataUrl(file, { maxSide: 360, maxChars: 3800 })
}

export async function applyToPost(data: {
  alumniId: string
  experienceId: string
  title: string
}): Promise<void> {
  await addDoc(collection(db, 'event_applications'), {
    alumniId: data.alumniId,
    experienceId: data.experienceId,
    title: data.title,
    createdAt: serverTimestamp(),
  })
}

export function subscribeMyApplications(
  alumniId: string,
  callback: (experienceIds: string[]) => void,
): Unsubscribe {
  const q = query(collection(db, 'event_applications'), where('alumniId', '==', alumniId))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => String(d.data().experienceId ?? '')))
  })
}

export function subscribeAlumniUsers(callback: (users: UserModel[]) => void): Unsubscribe {
  const q = query(collection(db, 'users'), where('role', '==', 'alumni'))
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => userFromFirestore(d.id, d.data() as Record<string, unknown>)),
    )
  })
}
