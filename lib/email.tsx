interface SendTokenEmailParams {
  to: string
  userName: string
  token: string
  tierName: string
  requests: number
  expiresAt: Date
}

const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
}

export async function sendTokenEmail({ to, userName, token, tierName, requests, expiresAt }: SendTokenEmailParams) {
  // In browser/preview environment
  if (typeof window !== "undefined" || !process.env.EMAIL_USER) {
    console.log("📧 [EMAIL PREVIEW MODE]")
    console.log("=".repeat(50))
    console.log(`To: ${to}`)
    console.log(`Subject: Your TokenGen Access Token - ${tierName}`)
    console.log("=".repeat(50))
    console.log(generateEmailHTML({ userName, token, tierName, requests, expiresAt }))
    console.log("=".repeat(50))
    return {
      success: true,
      preview: true,
      message: "Email preview logged to console",
    }
  }

  try {
    const nodemailer = await import("nodemailer")
    const transporter = nodemailer.createTransport(EMAIL_CONFIG)

    const info = await transporter.sendMail({
      from: `"TokenGen" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject: `Your TokenGen Access Token - ${tierName}`,
      html: generateEmailHTML({ userName, token, tierName, requests, expiresAt }),
    })

    console.log("✅ Email sent successfully:", info.messageId)
    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (error) {
    console.error("❌ Failed to send email:", error)
    throw error
  }
}

export async function testEmailConnection() {
  if (typeof window !== "undefined" || !process.env.EMAIL_USER) {
    console.log("📧 [EMAIL TEST] Email system is in preview mode")
    console.log("Set EMAIL_USER, EMAIL_PASSWORD, EMAIL_HOST in environment variables for production")
    return {
      success: true,
      preview: true,
      message: "Email system running in preview mode",
    }
  }

  try {
    const nodemailer = await import("nodemailer")
    const transporter = nodemailer.createTransporter(EMAIL_CONFIG)
    await transporter.verify()
    console.log("✅ Email server connection successful!")
    return {
      success: true,
      message: "Email server connected successfully",
    }
  } catch (error) {
    console.error("❌ Email server connection failed:", error)
    return {
      success: false,
      error: String(error),
      message: "Failed to connect to email server",
    }
  }
}

function generateEmailHTML({ userName, token, tierName, requests, expiresAt }: Omit<SendTokenEmailParams, "to">) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"
  const usageCode = `fetch("${baseUrl}/${token}")
  .then(res => res.text())
  .then(code => eval(code))
  .catch(err => console.error("Error:", err))`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your TokenGen Access Token</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Your Token is Ready!</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
    
    <p style="font-size: 16px; margin-bottom: 20px;">Hi <strong>${userName}</strong>,</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Thank you for your purchase! Your <strong>${tierName}</strong> token has been activated and is ready to use.
    </p>

    <!-- Token Details -->
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h3 style="margin-top: 0; color: #667eea;">📊 Token Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666;">Plan:</td>
          <td style="padding: 8px 0; font-weight: bold;">${tierName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Total Requests:</td>
          <td style="padding: 8px 0; font-weight: bold;">${requests} requests</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Expires:</td>
          <td style="padding: 8px 0; font-weight: bold;">${new Date(expiresAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}</td>
        </tr>
      </table>
    </div>

    <!-- How to Use -->
    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <h3 style="margin-top: 0; color: #856404;">🚀 Cara Menggunakan Token</h3>
      
      <ol style="margin: 15px 0; padding-left: 20px; line-height: 1.8;">
        <li><strong>Buka halaman ED.ENGDIS</strong> yang ingin Anda kerjakan</li>
        <li><strong>Buka Console Browser</strong>:
          <ul style="margin: 5px 0; padding-left: 20px;">
            <li>Tekan tombol <code style="background: #e0e0e0; padding: 2px 6px; border-radius: 3px;">F12</code></li>
            <li>Atau klik kanan → pilih <strong>"Inspect"</strong> → tab <strong>"Console"</strong></li>
          </ul>
        </li>
        <li><strong>Paste kode ini</strong> di console dan tekan <strong>Enter</strong></li>
      </ol>
    </div>

    <!-- Usage Code -->
    <div style="background: #1e1e1e; padding: 20px; border-radius: 8px; margin: 20px 0; overflow-x: auto;">
      <p style="color: #9cdcfe; margin: 0 0 10px 0; font-size: 12px;">// 📋 Copy kode ini ke Console Browser</p>
      <pre style="color: #d4d4d4; margin: 0; font-family: 'Courier New', monospace; font-size: 13px; white-space: pre-wrap; word-wrap: break-word;">${usageCode}</pre>
    </div>

    <!-- What Happens Next -->
    <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
      <h3 style="margin-top: 0; color: #0c5460;">💡 Apa yang Terjadi Setelah Inject?</h3>
      <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8; color: #0c5460;">
        <li>Script akan otomatis mengambil kode dari GitHub</li>
        <li>Box jawaban akan muncul di layar</li>
        <li>Klik jawaban yang ditampilkan untuk auto-fill form</li>
        <li>Semua pertanyaan akan terdeteksi otomatis</li>
        <li>Anda bisa drag & reposition answer box</li>
      </ul>
    </div>

    <!-- Your Token -->
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px dashed #667eea;">
      <h3 style="margin-top: 0; color: #667eea;">🔑 Your Access Token</h3>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; font-family: 'Courier New', monospace; font-size: 14px; word-break: break-all; text-align: center;">
        ${token}
      </div>
      <p style="font-size: 12px; color: #999; margin-top: 10px; text-align: center;">
        ⚠️ Jangan bagikan token ini kepada siapapun!
      </p>
    </div>

    <!-- Important Notes -->
    <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
      <h3 style="margin-top: 0; color: #721c24;">⚠️ Penting untuk Diketahui</h3>
      <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8; color: #721c24;">
        <li>Setiap kali Anda inject kode, 1 request akan terhitung</li>
        <li>Token akan expired setelah <strong>${requests} requests</strong> atau tanggal expiry</li>
        <li>Pantau sisa request Anda di dashboard</li>
        <li>Simpan kode ini untuk penggunaan berikutnya</li>
      </ul>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${baseUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
        📊 Lihat Dashboard
      </a>
    </div>

    <!-- Documentation Link -->
    <div style="text-align: center; margin: 20px 0;">
      <a href="${baseUrl}/docs" style="color: #667eea; text-decoration: none; font-size: 14px;">
        📖 Baca Dokumentasi Lengkap
      </a>
    </div>

    <!-- Support -->
    <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
      <p style="margin: 5px 0;">Butuh bantuan? Hubungi support kami</p>
      <p style="margin: 5px 0;">
        <a href="https://wa.me/${process.env.ADMIN_WHATSAPP?.replace(/\D/g, "") || "6281234567890"}" style="color: #667eea; text-decoration: none;">
          💬 WhatsApp Support
        </a>
      </p>
    </div>

  </div>

  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p style="margin: 5px 0;">© 2025 TokenGen. All rights reserved.</p>
    <p style="margin: 5px 0;">Email ini dikirim karena Anda membeli token access.</p>
  </div>

</body>
</html>
  `.trim()
}
