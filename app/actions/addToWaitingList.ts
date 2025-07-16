'use server';

export async function submitEmail(email:string) {

  if (!email || !email.includes('@')) {
    return { success: false, message: 'Invalid email' };
  }

  try {
    const res = await fetch(
      'https://script.google.com/macros/s/AKfycbzQdJa_hnYNxOqF7d8gEY8E-4YGj6SWUVFM0BhxNmOHOC2U-apwdtVf6mz4RKSjbkKS/exec',
      {
        method: 'POST',
        body: new URLSearchParams({ email }),
      }
    );

    if (res.ok) {
      return {
        success: true,
        message: 'Email saved successfully.',
      };
    } else {
      return {
        success: false,
        message: 'Failed to save email. Try again later.',
      };
    }
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: 'Unexpected error. Please try again.',
    };
  }
}
