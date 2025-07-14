import nodemailer from "nodemailer"

export async function sendEmailWithCode(email: string, code: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  await transporter.sendMail({
    from: '"Emailer Support" <your@email.com>',
    to: email,
    subject: "Your Password Reset Code",
    text: `Your password reset code is: ${code}`,
    html: `<p>Your password reset code is: <strong>${code}</strong></p>`,
  })
}
