export async function POST(req: Request) {
  const body = await req.json();

  const token = body.captchaToken;

  const formData = new FormData();

  formData.append("secret", process.env.TURNSTILE_SECRET_KEY!);

  formData.append("response", token);

  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

  const result = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const outcome = await result.json();

  if (!outcome.success) {
    return Response.json({
      success: false,
      message: "Captcha failed",
    });
  }

  return Response.json({
    success: true,
    message: "Captcha verified",
  });
}
