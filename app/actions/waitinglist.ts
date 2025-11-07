"use server";

export async function addToWaitList(data: { email: string }) {
  if (!data.email || !data.email.includes("@")) {
    throw new Error("Invalid email");
  }

  const scriptUrl = "https://script.google.com/macros/s/AKfycbzQdJa_hnYNxOqF7d8gEY8E-4YGj6SWUVFM0BhxNmOHOC2U-apwdtVf6mz4RKSjbkKS/exec";

  // Call the Apps Script endpoint
  const res = await fetch(`${scriptUrl}?email=${encodeURIComponent(data.email)}`, {
    method: "POST",
    cache: "no-store",
  });

  if (!res.ok) {
    return { success: false, message: 'Failed to add to waitlist' };
  }

  const text = await res.text();
  return { success: true, message: "Successfully added to waitlist" };
}

