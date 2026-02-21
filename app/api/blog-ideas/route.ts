import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { verifyAuth } from '@/lib/auth/serverAuth';

const COLLECTION_NAME = 'blog-ideas';

export async function GET(request: NextRequest) {
  if (!(await verifyAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .orderBy('createdAt', 'desc')
      .get();
      
    const ideas = snapshot.docs.map(doc => ({
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
  if (!(await verifyAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const newIdea = await request.json();
    
    const docRef = db.collection(COLLECTION_NAME).doc();
    await docRef.set({
      ...newIdea,
      createdAt: new Date().toISOString()
    });
    
    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Firebase POST error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await verifyAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, ...updates } = await request.json();
    await db.collection(COLLECTION_NAME).doc(id).update(updates);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Firebase PATCH error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await verifyAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    await db.collection(COLLECTION_NAME).doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Firebase DELETE error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
