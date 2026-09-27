import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  verifyPasswordResetCode,
  type User,
} from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import {
  roleLabel,
  roleLoginPath,
  userFromFirestore,
  userToFirestore,
  type UserModel,
  type UserRole,
} from '../lib/types'

export class AuthNotice extends Error {
  loginPath?: string

  constructor(message: string, loginPath?: string) {
    super(message)
    this.name = 'AuthNotice'
    this.loginPath = loginPath
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function findUserByEmail(email: string): Promise<UserModel | null> {
  const normalized = normalizeEmail(email)
  const variants = normalized === email.trim() ? [normalized] : [normalized, email.trim()]
  for (const value of variants) {
    const snap = await getDocs(
      query(collection(db, 'users'), where('email', '==', value), limit(1)),
    )
    if (!snap.empty) {
      const found = snap.docs[0]
      return userFromFirestore(found.id, found.data() as Record<string, unknown>)
    }
  }
  return null
}

function alreadyRegisteredMessage(existing: UserModel, attempted: UserRole): AuthNotice {
  if (existing.role === attempted) {
    return new AuthNotice(
      'This email is already registered. Please log in.',
      roleLoginPath(existing.role),
    )
  }
  const label = roleLabel(existing.role)
  return new AuthNotice(
    `This email is registered as ${label}. Please log in through the ${label} portal. It cannot be used for another role.`,
    roleLoginPath(existing.role),
  )
}

export async function registerUser(params: {
  email: string
  password: string
  name: string
  role: UserRole
  sapId?: string
}): Promise<UserModel> {
  const email = normalizeEmail(params.email)
  const existing = await findUserByEmail(email)
  if (existing) throw alreadyRegisteredMessage(existing, params.role)

  let cred
  try {
    cred = await createUserWithEmailAndPassword(auth, email, params.password)
  } catch (err) {
    const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : ''
    if (code === 'auth/email-already-in-use') {
      throw new AuthNotice('This email is already registered. Please log in.')
    }
    throw err
  }

  const uid = cred.user.uid
  const model: UserModel = {
    uid,
    email,
    name: params.name,
    role: params.role,
    sapId: params.sapId,
  }
  await setDoc(doc(db, 'users', uid), userToFirestore(model))
  await sendEmailVerification(cred.user)
  return model
}

export async function signIn(identifier: string, password: string): Promise<UserModel | null> {
  let emailToSignIn = identifier.trim()

  if (!emailToSignIn.includes('@')) {
    const q = query(
      collection(db, 'users'),
      where('sap id', '==', emailToSignIn),
      limit(1),
    )
    const snap = await getDocs(q)
    if (snap.empty) {
      throw new Error('No user found with this Roll Number.')
    }
    emailToSignIn = String(snap.docs[0].data().email ?? '')
  }

  const cred = await signInWithEmailAndPassword(auth, emailToSignIn, password)
  return fetchUserModel(cred.user.uid)
}

export async function fetchUserModel(uid: string): Promise<UserModel | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return userFromFirestore(snap.id, snap.data() as Record<string, unknown>)
}

export async function sendPasswordReset(email: string): Promise<void> {
  const target = email.trim()
  const actionUrl = `${window.location.origin}/reset-password`
  try {
    await sendPasswordResetEmail(auth, target, {
      url: actionUrl,
      handleCodeInApp: false,
    })
  } catch (err) {
    const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : ''
    if (code === 'auth/unauthorized-continue-uri' || code === 'auth/invalid-continue-uri') {
      await sendPasswordResetEmail(auth, target)
      return
    }
    if (code === 'auth/user-not-found') {
      throw new Error('No account found for this email.')
    }
    throw err
  }
}

export async function completePasswordReset(code: string, newPassword: string): Promise<void> {
  await verifyPasswordResetCode(auth, code)
  await confirmPasswordReset(auth, code, newPassword)
}

export async function signInWithGoogle(expectedRole: UserRole): Promise<UserModel> {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  let cred
  try {
    cred = await signInWithPopup(auth, provider)
  } catch (err) {
    const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : ''
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      throw new AuthNotice('Google sign-in was cancelled.')
    }
    if (code === 'auth/account-exists-with-different-credential' || code === 'auth/email-already-in-use') {
      throw new AuthNotice('This email is already registered. Please continue with email and log in.')
    }
    if (code === 'auth/operation-not-allowed' || code === 'auth/unauthorized-domain') {
      throw new AuthNotice('Google sign-in is not enabled for this site yet. Continue with email.')
    }
    throw err
  }

  const email = cred.user.email?.trim().toLowerCase()
  if (!email) {
    await firebaseSignOut(auth)
    throw new AuthNotice('Google did not share an email address. Continue with email instead.')
  }

  let model = await fetchUserModel(cred.user.uid)
  if (!model) {
    const existing = await findUserByEmail(email)
    if (existing && existing.uid !== cred.user.uid) {
      await firebaseSignOut(auth)
      throw alreadyRegisteredMessage(existing, expectedRole)
    }
    const photo = cred.user.photoURL && cred.user.photoURL.length <= 4000 ? cred.user.photoURL : undefined
    model = {
      uid: cred.user.uid,
      email,
      name: cred.user.displayName?.trim() || 'Member',
      role: expectedRole,
      photoUrl: photo,
    }
    await setDoc(doc(db, 'users', model.uid), userToFirestore(model))
  }

  if (model.role !== expectedRole) {
    await firebaseSignOut(auth)
    throw alreadyRegisteredMessage(model, expectedRole)
  }
  return model
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

export async function updateUserProfile(
  uid: string,
  data: Partial<{
    name: string
    email: string
    photoUrl: string
    classYear: string
    degree: string
    institution: string
    jobTitle: string
    company: string
    phone: string
  }>,
): Promise<void> {
  const payload: Record<string, string> = {}
  if (data.name != null) payload.name = data.name
  if (data.email != null && data.email !== '') payload.email = data.email
  if (data.photoUrl != null) payload.photoUrl = data.photoUrl
  if (data.classYear != null) payload.classYear = data.classYear
  if (data.degree != null) payload.degree = data.degree
  if (data.institution != null) payload.institution = data.institution
  if (data.jobTitle != null) payload.jobTitle = data.jobTitle
  if (data.company != null) payload.company = data.company
  if (data.phone != null) payload.phone = data.phone
  await setDoc(doc(db, 'users', uid), payload, { merge: true })
}

export function subscribeAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback)
}
