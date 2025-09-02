// app/api/public-lead/route.js

import connectDB from "@/lib/mongoose";
import { Lead } from "@/models";
import ShortUniqueId from "short-unique-id";

const uid = new ShortUniqueId();

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, email, contact, request, source, sale, contact_status, comments } = body;

        if (!name || !email || !contact || !request) {
            return new Response(JSON.stringify({ status: "ERROR", message: "Missing required fields" }), {
                status: 400,
            });
        }

        await connectDB();

        const leadId = uid.rnd();
        
        const leadDoc = new Lead({
            _id: leadId,
            name,
            email: email.toLowerCase(),
            contact,
            request,
            source: source || null,
            sale: sale || null,
            contact_status: contact_status || null,
            comments: comments || null,
            user_id: null, // No user assigned for public leads
            status: "NEW",
            activity: [
                {
                    message: "<p class='mb-0'>Lead added via public API</p>",
                    date_time: new Date(),
                },
            ],
        });
        
        await leadDoc.save();

        return new Response(JSON.stringify({ status: "OK", message: "Lead added successfully" }), {
            status: 200,
        });

    } catch (error) {
        console.error("Public lead API error:", error);
        return new Response(JSON.stringify({ status: "ERROR", message: error.message }), {
            status: 500,
        });
    }
}