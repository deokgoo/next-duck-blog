import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy 
} from 'firebase/firestore';

const COLLECTION_NAME = 'blog-ideas';

// 인증 확인 함수
function checkAuth() {
  const cookieStore = cookies();
  const authCookie = cookieStore.get('blog-ideas-auth');
  return authCookie?.value === 'true';
}

export async function GET() {
  if (!checkAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const ideas = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return NextResponse.json({ ideas });
  } catch (error) {
    console.error('Firebase GET error:', error);
    return NextResponse.json({ ideas: [] });
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('POST request received');
    const newIdea = await request.json();
    console.log('New idea:', newIdea);
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...newIdea,
      createdAt: new Date().toISOString()
    });
    console.log('Document added with ID:', docRef.id);
    
    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Firebase POST error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!checkAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, ...updates } = await request.json();
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Firebase PATCH error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Firebase DELETE error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
