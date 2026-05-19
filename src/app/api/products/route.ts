import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { TrackedProduct } from '@/components/dashboard/ProductCard';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('priceDrop');
    const products = await db.collection('products').find({}).sort({ _id: -1 }).toArray();
    
    // Map _id to id for the frontend
    const formattedProducts = products.map(p => ({
      ...p,
      id: p._id.toString(),
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const productData: TrackedProduct = await request.json();
    const client = await clientPromise;
    const db = client.db('priceDrop');
    
    const result = await db.collection('products').insertOne({
      ...productData,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to save product' }, { status: 500 });
  }
}
