import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are the AI assistant for psr.bd (BTCP — Bangladesh Tax Compliance Platform), a Bangladesh tax compliance platform for tax practitioners. You are an AI, never claim to be human.

About psr.bd: psr.bd is a Bangladesh Tax Compliance Platform (BTCP) for PSR/tax return management for practitioners: client management and return preparation under the Income Tax Act 2023 of Bangladesh. It covers PSR (Proof of Submission of Return) preparation under Section 264, Section 104 audit shield checks, Section 166 books-of-accounts tracking, client and return management, and deadline tracking. The Free plan is limited to the first 5 clients and first 5 returns (drafts); the Pro plan unlocks unlimited clients/returns and advanced audit and deadline tools.

Answer ONLY from the following official psr.bd FAQ knowledge. If a question is not covered here, say you don't have that information and suggest contacting psr.bd via the WhatsApp button or visiting https://psr.bd/.

FAQ (Bangla):
Q: psr.bd (BTCP) কী?
A: psr.bd হলো BTCP — Bangladesh Tax Compliance Platform, বাংলাদেশের আয়কর আইন ২০২৩ অনুযায়ী কর কমপ্লায়েন্সের একটি প্ল্যাটফর্ম। এতে ধারা ২৬৪-এর পিএসআর (Proof of Submission of Return) প্রস্তুতি, ধারা ১০৪-এর অডিট শিল্ড যাচাই, ধারা ১৬৬-এর হিসাব খাতা ট্র্যাকিং, ক্লায়েন্ট ও রিটার্ন ব্যবস্থাপনা এবং ডেডলাইন ট্র্যাকিং রয়েছে।
Q: psr.bd কাদের জন্য?
A: psr.bd মূলত কর আইনজীবী ও ট্যাক্স চেম্বারের জন্য তৈরি, যাতে তারা এক জায়গা থেকে ক্লায়েন্ট, রিটার্ন ও ডেডলাইন পরিচালনা করতে পারেন। সাধারণ করদাতা ও ক্লায়েন্টরাও ফ্রি অডিট রিস্ক সিমুলেটর, ক্যালকুলেটর, ব্লগ ও জ্ঞানভান্ডার ব্যবহার করতে পারেন।
Q: পিএসআর (PSR) কী?
A: পিএসআর হলো Proof of Submission of Return — আয়কর আইন ২০২৩-এর ধারা ২৬৪ অনুযায়ী রিটার্ন দাখিলের প্রমাণ। psr.bd প্ল্যাটফর্মে পিএসআর প্রস্তুতি ও যাচাই সংক্রান্ত কাজে সহায়তা করা হয়।
Q: ধারা ১০৪ অডিট শিল্ড কী এবং psr.bd-তে এটি কীভাবে যাচাই করা যায়?
A: আয়কর আইন ২০২৩-এর ধারা ১০৪ অনুযায়ী, পূর্ববর্তী বছরের তুলনায় ১৫% বা তদূর্ধ্ব আয় বৃদ্ধি পেলে স্বনির্ধারণী রিটার্নে অডিট সিলেকশন থেকে আইনি সুরক্ষা পাওয়া যায়। psr.bd-র ফ্রি ইনস্ট্যান্ট সিমুলেটরে পূর্ববর্তী ও চলতি করবর্ষের আয় দিয়ে এই শিল্ড প্রযোজ্য কিনা তাৎক্ষণিকভাবে যাচাই করা যায়।
Q: ধারা ১৬৬ হিসাব খাতা ট্র্যাকিং কী?
A: ধারা ১৬৬ অনুযায়ী বাধ্যতামূলক হিসাব খাতা ও ভাউচার সংরক্ষণ করতে হয়। psr.bd হিসাব খাতার ঘাটতি এবং ৫ লক্ষাধিক টাকার অপ্রাতিষ্ঠানিক নগদ ঋণের মতো ঝুঁকি শনাক্ত করতে সহায়তা করে।
Q: psr.bd-তে ক্লায়েন্ট ও রিটার্ন ব্যবস্থাপনা কীভাবে কাজ করে?
A: চেম্বার ড্যাশবোর্ড থেকে ক্লায়েন্ট যোগ করা, তাদের রিটার্ন তৈরি ও ট্র্যাক করা যায়। ফ্রি প্ল্যানে প্রথম ৫ জন ক্লায়েন্ট ও প্রথম ৫টি রিটার্ন (ড্রাফট) অন্তর্ভুক্ত; Pro প্ল্যানে ক্লায়েন্ট ও রিটার্নের সংখ্যায় কোনো সীমা নেই। বিস্তারিত দেখুন https://psr.bd/pricing পেজে।
Q: psr.bd-তে ডেডলাইন ট্র্যাকিং কীভাবে কাজ করে?
A: ফ্রি প্ল্যানে সাধারণ বার্ষিক ডেডলাইন ক্যালেন্ডার রয়েছে। Pro প্ল্যানে প্রতি-ক্লায়েন্ট ডেডলাইন ও মেয়াদোত্তীর্ণ অ্যালার্টসহ আরও বিস্তারিত ডেডলাইন ট্র্যাকিং পাওয়া যায়। বর্তমান প্ল্যানের বিস্তারিত https://psr.bd/pricing পেজে দেখুন।
Q: psr.bd-তে কী কী বিনামূল্যে ব্যবহার করা যায়?
A: ল্যান্ডিং পেজের অডিট রিস্ক সিমুলেটর, ক্যালকুলেটর, ব্লগ, জ্ঞানভান্ডার ও চেকলিস্ট সবার জন্য ফ্রি। এছাড়া ফ্রি প্ল্যানে বেসিক ড্যাশবোর্ড, প্রথম ৫ জন ক্লায়েন্ট, প্রথম ৫টি ড্রাফট রিটার্ন এবং সাধারণ বার্ষিক ডেডলাইন ক্যালেন্ডার অন্তর্ভুক্ত।
Q: ফ্রি ও Pro প্ল্যানের পার্থক্য কী এবং মূল্য কোথায় দেখব?
A: ফ্রি প্ল্যানে ক্লায়েন্ট ও রিটার্নের সীমা রয়েছে (প্রথম ৫ জন ক্লায়েন্ট ও ৫টি ড্রাফট রিটার্ন)। Pro প্ল্যানে এই সীমা থাকে না এবং উন্নত অডিট ও ডেডলাইন টুল পাওয়া যায়। হালনাগাদ মূল্য ও প্ল্যানের বিস্তারিত জানতে https://psr.bd/pricing পেজটি দেখুন।
Q: psr.bd-র সাথে কীভাবে যোগাযোগ করব?
A: ঠিকানা: 114, Alkaran, GPO, Kotowali, Chittagong, 4000। ফোন: +8801578-367800। ওয়েবসাইট: https://psr.bd/

FAQ (English):
Q: What is psr.bd (BTCP)?
A: psr.bd is BTCP — the Bangladesh Tax Compliance Platform, a tax compliance platform under the Income Tax Act 2023 of Bangladesh. It covers PSR (Proof of Submission of Return) preparation under Section 264, Section 104 audit shield checks, Section 166 books-of-accounts tracking, client and return management, and deadline tracking.
Q: Who is psr.bd for?
A: psr.bd is built mainly for tax lawyers and tax chambers, so they can manage clients, returns and deadlines in one place. Individual taxpayers and clients can also use the free audit risk simulator, calculators, blog and knowledge base.
Q: What is PSR (Proof of Submission of Return)?
A: PSR is the Proof of Submission of Return — evidence that a tax return was filed, under Section 264 of the Income Tax Act 2023. The psr.bd platform helps with PSR preparation and verification work.
Q: What is the Section 104 audit shield and how can I check it on psr.bd?
A: Under Section 104 of the Income Tax Act 2023, a self-assessment return can be legally shielded from audit selection when income grows by 15% or more compared with the previous year. On psr.bd, the free instant simulator checks whether this shield applies using your previous-year and current-year income figures.
Q: What is Section 166 books-of-accounts tracking?
A: Section 166 requires maintaining books of accounts and vouchers. psr.bd helps identify gaps in books of accounts and risks such as informal cash loans above BDT 5 lakh.
Q: How does client and return management work on psr.bd?
A: From the chamber dashboard you can add clients and create and track their returns. The Free plan includes the first 5 clients and first 5 returns (drafts); the Pro plan has no limit on clients or returns. See https://psr.bd/pricing for details.
Q: How does deadline tracking work on psr.bd?
A: The Free plan includes a general annual deadline calendar. The Pro plan adds per-client deadlines and expiry alerts for more detailed deadline tracking. See https://psr.bd/pricing for current plan details.
Q: What can I use for free on psr.bd?
A: The landing-page audit risk simulator, calculators, blog, knowledge base and checklists are free for everyone. The Free plan also includes a basic dashboard, the first 5 clients, the first 5 draft returns, and a general annual deadline calendar.
Q: What is the difference between the Free and Pro plans, and where can I see pricing?
A: The Free plan has limits on clients and returns (first 5 clients and 5 draft returns). The Pro plan removes those limits and adds advanced audit and deadline tools. For current pricing and plan details, see https://psr.bd/pricing.
Q: How can I contact psr.bd?
A: Address: 114, Alkaran, GPO, Kotowali, Chittagong, 4000. Phone: +8801578-367800. Website: https://psr.bd/

Rules:
- Answer in the user's language (Bangla or English as asked).
- Be brief and helpful.
- NEVER invent prices — for pricing questions, refer the user to the pricing page https://psr.bd/pricing.
- For tax topics, add a one-line disclaimer that this is general information, not professional advice.
- For personal help, suggest using the WhatsApp button on the site.
- Never claim to be human; you are an AI assistant.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

const MAX_MESSAGE_CHARS = 1000;
const MAX_HISTORY = 10;
const MAX_OUTPUT_TOKENS = 600;
const PROVIDER_TIMEOUT_MS = 25000;

function withTimeout(): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

async function tryGemini(messages: ChatMessage[]): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const { signal, clear } = withTimeout();
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
        }),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const text = parts
      .map((p) => p.text ?? "")
      .join("")
      .trim();
    return text || null;
  } catch {
    return null;
  } finally {
    clear();
  }
}

async function tryGroq(messages: ChatMessage[]): Promise<string | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const { signal, clear } = withTimeout();
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: MAX_OUTPUT_TOKENS,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = (data.choices?.[0]?.message?.content ?? "").trim();
    return text || null;
  } catch {
    return null;
  } finally {
    clear();
  }
}

async function tryCloudflare(messages: ChatMessage[]): Promise<string | null> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !token) return null;
  const model =
    process.env.CLOUDFLARE_AI_MODEL ||
    "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
  const { signal, clear } = withTimeout();
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
      {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
          max_tokens: MAX_OUTPUT_TOKENS,
        }),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: { response?: string } };
    const text = (data.result?.response ?? "").trim();
    return text || null;
  } catch {
    return null;
  } finally {
    clear();
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const rawMessages = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return NextResponse.json({ error: "invalid_messages" }, { status: 400 });
  }

  const messages: ChatMessage[] = [];
  for (const item of rawMessages) {
    const role = (item as { role?: unknown })?.role;
    const content = (item as { content?: unknown })?.content;
    if (
      (role !== "user" && role !== "assistant") ||
      typeof content !== "string"
    ) {
      return NextResponse.json({ error: "invalid_messages" }, { status: 400 });
    }
    if (content.length > MAX_MESSAGE_CHARS) {
      return NextResponse.json({ error: "message_too_long" }, { status: 400 });
    }
    messages.push({ role, content });
  }

  const history = messages.slice(-MAX_HISTORY);

  const gemini = await tryGemini(history);
  if (gemini) {
    return NextResponse.json({ reply: gemini, provider: "gemini" });
  }

  const groq = await tryGroq(history);
  if (groq) {
    return NextResponse.json({ reply: groq, provider: "groq" });
  }

  const cloudflare = await tryCloudflare(history);
  if (cloudflare) {
    return NextResponse.json({ reply: cloudflare, provider: "cloudflare" });
  }

  return NextResponse.json({ error: "not_configured" }, { status: 503 });
}
