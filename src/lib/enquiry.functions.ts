import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Only enable after a verified sender and production delivery test are complete.
export const enquiryDelivery = createServerFn().handler(() => ({
  enabled:
    process.env.EYESPYR_EMAIL_ENABLED === "true" &&
    !!process.env.RESEND_API_KEY &&
    !!process.env.EYESPYR_EMAIL_FROM,
}));

export const sendEnquiry = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().trim().email().max(180),
      body: z.string().trim().min(30).max(15000),
      requestId: z.string().uuid(),
      websiteExtra: z.string().max(200),
      consent: z.literal(true),
    }),
  )
  .handler(async ({ data }) => {
    if (data.websiteExtra) return { accepted: false };
    if (
      process.env.EYESPYR_EMAIL_ENABLED !== "true" ||
      !process.env.RESEND_API_KEY ||
      !process.env.EYESPYR_EMAIL_FROM
    ) {
      return { accepted: false };
    }
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `eyespyr-enquiry-${data.requestId}`,
        },
        body: JSON.stringify({
          from: process.env.EYESPYR_EMAIL_FROM,
          to: ["partnerships@industryarmymarketing.com"],
          reply_to: data.email,
          subject: "EyeSpyR business profile enquiry",
          text: data.body,
        }),
        signal: AbortSignal.timeout(12000),
      });
      const result = await response.json();
      return { accepted: response.ok && typeof result.id === "string" };
    } catch {
      return { accepted: false };
    }
  });
