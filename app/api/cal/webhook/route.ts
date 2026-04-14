// simple webhook receiver for Cal.com events
import * as fs from 'fs';
import * as path from 'path';

export async function POST(req: Request) {
  try {
    const ev = await req.json();
    console.log('Cal.com webhook received', ev?.type || 'unknown');

    // persist to data/cal_webhooks.json
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      const filePath = path.join(dataDir, 'cal_webhooks.json');
      let arr = [];
      if (fs.existsSync(filePath)) {
        try { arr = JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]'); } catch (e) { arr = []; }
      }
      arr.push({ receivedAt: new Date().toISOString(), event: ev });
      fs.writeFileSync(filePath, JSON.stringify(arr, null, 2));
    } catch (e) {
      console.error('Failed to persist webhook', e);
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('Webhook error', e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}
