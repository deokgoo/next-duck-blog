import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, get } from 'firebase/database'

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

export const registerWeight = async (
  uuid: string,
  date: number,
  originWeight: string,
  todayWeight: number
) => {
  const db = getDatabase(app)

  await set(ref(db, `users/${uuid}/${date}`), {
    root: originWeight,
    todayWeight: todayWeight,
  })
}

export const getAllData = () => {
  const db = getDatabase(app)
  const starCountRef = ref(db, `users`)

  return get(starCountRef).then((x) => x.val())
}
