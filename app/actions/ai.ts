
'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function getSensoryExpansion(text: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `You are a creative writing assistant. Take the following sentence and expand it with sensory details. Provide three distinct options, one for each of the following senses: See, Smell, and Feel. Return the options as a JSON object with the keys "see", "smell", and "feel".

Sentence: ${text}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const json = response.text().replace(/```json/g, "").replace(/```/g, "");

  return JSON.parse(json);
}

export async function getGhostToneFix(text: string, context: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `You are a creative writing assistant. Analyze the following text and the provided context, then rewrite the text to better match the established voice, rhythm, and vocabulary of the context. Return only the rewritten text.

Context: ${context}

Text: ${text}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return response.text();
}

export async function getConflictInjection(text: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `You are a creative writing assistant. Analyze the following paragraph and the characters mentioned within it. Suggest three distinct ways to add immediate tension to the scene. Return the suggestions as a JSON object with the keys "suggestion1", "suggestion2", and "suggestion3".

Paragraph: ${text}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const json = response.text().replace(/```json/g, "").replace(/```/g, "");

  return JSON.parse(json);
}

export async function updateVoiceProfile(userId: string, text: string) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
      },
    }
  );

  const { data, error } = await supabase
    .from("voice_profiles")
    .select("id, profile")
    .eq("user_id", userId)
    .single();

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Analyze the following text and extract a voice profile. The profile should include sentence rhythm, vocabulary, and tone. Return the profile as a JSON object.

Text: ${text}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const json = response.text().replace(/```json/g, "").replace(/```/g, "");

  if (data) {
    await supabase.from("voice_profiles").update({ profile: json, updated_at: new Date().toISOString() }).eq("id", data.id);
  } else {
    await supabase.from("voice_profiles").insert({ user_id: userId, profile: json });
  }
}

export async function createStoryElement(draftId: string, name: string, type: string) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("story_elements")
    .insert({ draft_id: draftId, user_id: user.id, name, type, details: {} })
    .select();

  if (error) {
    throw error;
  }

  return data[0];
}

export async function getAICharacterDetails(name: string, draftContent: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Based on the following draft, generate a backstory and a core motivation for the character "${name}". Return the result as a JSON object with the keys "backstory" and "core_motivation".\n\nDraft:\n${draftContent}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const json = response.text().replace(/```json/g, "").replace(/```/g, "");

  return JSON.parse(json);
}

export async function getCardFusion(character: string, location: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Generate a starter sentence for a scene featuring the character "${character}" at the location "${location}".`;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return response.text();
}
