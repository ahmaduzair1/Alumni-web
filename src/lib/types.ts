export type UserRole = 'alumni' | 'ssd' | 'dept'

export interface UserModel {
  uid: string
  email: string
  name: string
  role: UserRole
  sapId?: string
  photoUrl?: string
  classYear?: string
  degree?: string
  institution?: string
  jobTitle?: string
  company?: string
  phone?: string
}

export interface EventDoc {
  id: string
  title: string
  description: string
  date: Date | null
  location: string
  organizer: string
  department?: string
  createdAt: Date | null
}

export interface EventRegistration {
  uid: string
  name: string
  email: string
  registeredAt: Date | null
}

export type TranscriptStatus = 'Pending' | 'Approved' | 'Rejected'

export interface TranscriptRequest {
  id: string
  alumniId: string
  alumniName: string
  sapId: string
  documentType: string
  registrationNo: string
  status: TranscriptStatus
  reason?: string
  createdAt: Date | null
}

export interface ExperienceDoc {
  id: string
  authorId: string
  author: string
  classInfo: string
  title: string
  content: string
  imageUrl?: string
  avatarUrl?: string
  likes: number
  comments: number
  createdAt: Date | null
}

export function parseRole(value: unknown): UserRole {
  if (value === 'ssd' || value === 'dept' || value === 'alumni') return value
  return 'alumni'
}

export function roleLabel(role: UserRole): string {
  if (role === 'ssd') return 'SSD'
  if (role === 'dept') return 'Department coordinator'
  return 'Alumni'
}

export function roleLoginPath(role: UserRole): string {
  if (role === 'ssd') return '/login/ssd'
  if (role === 'dept') return '/login/dept'
  return '/login/alumni'
}

export function userFromFirestore(uid: string, data: Record<string, unknown>): UserModel {
  return {
    uid,
    email: String(data.email ?? ''),
    name: String(data.name ?? data.displayName ?? ''),
    role: parseRole(data.role),
    sapId: data['sap id'] != null ? String(data['sap id']) : undefined,
    photoUrl: data.photoUrl != null ? String(data.photoUrl) : undefined,
    classYear: data.classYear != null ? String(data.classYear) : undefined,
    degree: data.degree != null ? String(data.degree) : undefined,
    institution: data.institution != null ? String(data.institution) : undefined,
    jobTitle: data.jobTitle != null ? String(data.jobTitle) : undefined,
    company: data.company != null ? String(data.company) : undefined,
    phone: data.phone != null ? String(data.phone) : undefined,
  }
}

export function userToFirestore(user: Omit<UserModel, 'uid'>): Record<string, string> {
  const map: Record<string, string> = {
    email: user.email,
    name: user.name,
    role: user.role,
  }
  if (user.sapId) map['sap id'] = user.sapId
  if (user.photoUrl) map.photoUrl = user.photoUrl
  if (user.classYear) map.classYear = user.classYear
  if (user.degree) map.degree = user.degree
  if (user.institution) map.institution = user.institution
  if (user.jobTitle) map.jobTitle = user.jobTitle
  if (user.company) map.company = user.company
  if (user.phone) map.phone = user.phone
  return map
}
