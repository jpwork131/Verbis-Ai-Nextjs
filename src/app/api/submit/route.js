
import { NextResponse } from 'next/server';
import { appendToSheet } from '@/lib/google-sheets';

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ success: false, message: 'Type and data are required' }, { status: 400 });
    }

    // Determine the sheet name based on the submission type
    const sheetTitle = type === 'contact' ? 'Contact Submissions' : 'Newsletter Subscriptions';

    const result = await appendToSheet(data, sheetTitle);

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Data saved successfully!' });
    } else {
      return NextResponse.json({ success: false, message: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
