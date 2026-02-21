import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { Template } from '@/lib/db/templates';
import { verifyAuth } from '@/lib/auth/serverAuth';

const COLLECTION_NAME = 'templates';

export async function GET(request: NextRequest) {
  try {
    if (!(await verifyAuth(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const snapshot = await db
      .collection(COLLECTION_NAME)
      .orderBy('createdAt', 'desc')
      .get();
      
    const templates: Template[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Template));

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAuth(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Check if it's a seed request or single create
    if (Array.isArray(body)) {
        // Batch write for seeding
        const batch = db.batch();
        
        body.forEach((template: Omit<Template, 'id'>) => {
            const docRef = db.collection(COLLECTION_NAME).doc();
            batch.set(docRef, {
                ...template,
                createdAt: Date.now()
            });
        });
        
        await batch.commit();
        return NextResponse.json({ message: 'Templates seeded successfully' });
    } else {
        // Single create
        const docRef = db.collection(COLLECTION_NAME).doc();
        await docRef.set({
            ...body,
            createdAt: Date.now()
        });
        return NextResponse.json({ id: docRef.id });
    }
  } catch (error) {
    console.error('Error saving template:', error);
    return NextResponse.json(
      { error: 'Failed to save template' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await verifyAuth(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await db.collection(COLLECTION_NAME).doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await verifyAuth(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await db.collection(COLLECTION_NAME).doc(id).update({
      ...updates,
      updatedAt: Date.now(), // Optional: track updates
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}
