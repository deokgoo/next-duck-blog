import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
      console.error('❌ Missing Firebase credentials in .env.local');
      process.exit(1);
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin Initialized');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    process.exit(1);
  }
}

// Use getFirestore to specify the named database 'blog-db'
import { getFirestore } from 'firebase-admin/firestore';
const db = getFirestore(admin.app(), 'blog-db');

async function migratePosts() {
  const blogDir = path.join(process.cwd(), 'data', 'blog');
  
  if (!fs.existsSync(blogDir)) {
    console.error(`❌ Blog directory not found: ${blogDir}`);
    return;
  }

  // Get all MDX files recursively
  const getFiles = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(getFiles(file));
      } else {
        if (file.endsWith('.mdx') || file.endsWith('.md')) {
          results.push(file);
        }
      }
    });
    return results;
  };

  const files = getFiles(blogDir);
  console.log(`📂 Found ${files.length} posts to migrate...`);

  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    try {
      const fileContent = fs.readFileSync(file, 'utf8');
      const { data, content } = matter(fileContent);

      // Generate slug from filename relative to data/blog
      const relativePath = path.relative(blogDir, file);
      const slug = relativePath
        .replace(/\.(mdx|md)$/, '')
        // Replace windows backslashes
        .replace(/\\/g, '/');

      // Create document ID from slug (replace / with - for compatibility if needed, but keeping simple for now)
      // Firestore IDs can contain /, but it creates subcollections. 
      // Strategy: Use the full slug string as a field, and a sanitized string as the doc ID.
      const docId = slug.replace(/\//g, '--');

      const postData = {
        title: data.title || 'Untitled',
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        tags: data.tags || [],
        summary: data.summary || '',
        draft: data.draft || false,
        layout: data.layout || 'PostLayout',
        images: data.images || [],
        authors: data.authors || ['default'],
        slug: slug, // The URL slug (e.g., 'category/post-name')
        content: content, // The MDX content string
        migratedAt: new Date().toISOString(),
      };

      await db.collection('posts').doc(docId).set(postData);
      console.log(`✅ Migrated: ${slug}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to migrate ${file}:`, error);
      errorCount++;
    }
  }

  console.log(`\n🎉 Migration Complete!`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
}

migratePosts();
