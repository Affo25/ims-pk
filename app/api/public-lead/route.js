// app/api/public-lead/route.js

import { createClient } from "@/lib/supabase-server";

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, email, contact, request, source, sale, contact_status, comments } = body;

        if (!name || !email || !contact || !request) {
            return new Response(JSON.stringify({ status: "ERROR", message: "Missing required fields" }), {
                status: 400,
            });
        }

        const supabase = await createClient();

        const { error } = await supabase
            .from("leads")
            .insert({
                name,
                email: email.toLowerCase(),
                contact,
                request,
                source: source || null,
                sale: sale || null,
                contact_status: contact_status || null,
                comments: comments || null,
                status: "NEW",
                created_at: new Date(),
                activity: [
                    {
                        message: "<p class='mb-0'>Lead added via public API</p>",
                        date_time: new Date(),
                    },
                ],
            });

        if (error) {
            return new Response(JSON.stringify({ status: "ERROR", message: error.message }), {
                status: 500,
            });
        }

        return new Response(JSON.stringify({ status: "OK", message: "Lead added successfully" }), {
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ status: "ERROR", message: error.message }), {
            status: 500,
        });
    }
}
