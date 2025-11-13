import { sendTokenEmail, testEmailConnection } from "../lib/email"

async function main() {
  console.log("Testing email configuration...")

  // Test connection
  const connectionTest = await testEmailConnection()
  if (!connectionTest.success) {
    console.error("Email connection failed!")
    return
  }

  console.log("Connection successful! Sending test email...")

  // Send test email
  try {
    await sendTokenEmail({
      to: "test@example.com", // Change this to your email
      userName: "Test User",
      token: "abc123def456ghi789jkl012mno345pqr678stu901",
      tierName: "Professional",
      requests: 500,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    })

    console.log("Test email sent successfully!")
  } catch (error) {
    console.error("Failed to send test email:", error)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
