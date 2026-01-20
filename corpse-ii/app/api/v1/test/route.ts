export async function GET() {
    // Sleep for 30 seconds
    await new Promise((resolve) => setTimeout(resolve, 30000));

    // Return success response
    return Response.json({ success: true });
}
