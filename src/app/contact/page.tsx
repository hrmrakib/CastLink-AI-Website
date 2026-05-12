"use client";

import Turnstile from "react-turnstile";
import { useState } from "react";

export default function ContactForm() {
  const [token, setToken] = useState("");

  const handleSubmit = async () => {
    if (!token) {
      alert("Please verify captcha");
      return;
    }

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        captchaToken: token,
      }),
    });

    const data = await res.json();

    console.log(data);
  };

  return (
    <div>
      <Turnstile
        sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={(token) => {
          setToken(token);
        }}
      />

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
