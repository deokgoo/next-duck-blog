import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, onValue } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyDPgtveIcbEmBczxIUBGHBcnOWfJtDtPJY',
  authDomain: 'diet-battle-ea0be.firebaseapp.com',
  projectId: 'diet-battle-ea0be',
  storageBucket: 'diet-battle-ea0be.appspot.com',
  messagingSenderId: '328055400858',
  appId: '1:328055400858:web:458ba78f3f290efb833223',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

export const registerRootWeight = (uuid: string, rootWeight: string) => {
  const db = getDatabase(app)

  set(ref(db, `users/${uuid}`), {
    root: rootWeight,
  })
}

export const getRootWeight = (uuid: string) => {
  const db = getDatabase(app)
  const starCountRef = ref(db, `users/${uuid}`)

  onValue(starCountRef, (snapshot) => {
    const data = snapshot.val()
  })
}
