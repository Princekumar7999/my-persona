import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // VAPI sends tool calls via messages
    const callDetails = payload.message?.toolCalls?.[0]?.function;
    if (!callDetails) {
      return NextResponse.json({ results: [{ toolCallId: payload.message?.toolCalls?.[0]?.id, result: "No function provided" }] });
    }

    const args = typeof callDetails.arguments === 'string' ? JSON.parse(callDetails.arguments) : callDetails.arguments;
    
    if (callDetails.name === 'book_meeting') {
       // Mocking booking logic for now as v2 API requires precise timezone/metadata.
       // In a full production deploy, this will use the @calcom/api
       console.log("VAPI Requested Booking:", args);

       return NextResponse.json({
         results: [{
           toolCallId: payload.message.toolCalls[0].id,
           result: "Meeting booked successfully!"
         }]
       });
    }

    return NextResponse.json({ results: [] });
  } catch(e) {
    console.error(e);
    return NextResponse.json({ error: "Booking Failed" }, { status: 500 });
  }
}
