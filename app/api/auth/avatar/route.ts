import { NextRequest, NextResponse } from "next/server";




// Uploading a new avatar for new users
export async function POST(request: NextRequest) {

    //Implement functionality with supabase.storage.create

    

    // Need to return URL of uploaded avatar to update in user profile
    return NextResponse.json({ message: 'Avatar upload not implemented yet' }, { status: 501 });
}


// Updating avatar for existing users
export async function PUT(request: NextRequest) {

    //Implement functionality with supabase.storage.update??



    // Need to return URL of uploaded avatar to update in user profile
    return NextResponse.json({ message: 'Avatar update not implemented yet' }, { status: 501 });
}

