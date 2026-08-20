"use client";

import React, { useState } from "react";
import Turnstile from "react-turnstile";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setSubmitStatus("error");
      setErrorMessage("Please verify that you are a human by completing the captcha.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          captchaToken: token,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
        setToken(""); // Reset token to require re-verification for next message
      } else {
        setSubmitStatus("error");
        setErrorMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage("Network error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden'>
        <div className='bg-[#2563EB] px-8 py-10 text-white text-center'>
          <h2 className='text-3xl font-bold mb-2'>Get in Touch</h2>
          <p className='text-blue-100'>We'd love to hear from you. Please fill out the form below.</p>
        </div>
        
        <div className='px-8 py-10'>
          {submitStatus === 'success' ? (
            <div className='flex flex-col items-center justify-center py-10 text-center'>
              <CheckCircle2 className='w-16 h-16 text-green-500 mb-4' />
              <h3 className='text-2xl font-bold text-gray-900 mb-2'>Message Sent!</h3>
              <p className='text-gray-600 mb-6'>Thank you for contacting us. We'll get back to you shortly.</p>
              <Button onClick={() => setSubmitStatus('idle')} className='bg-[#2563EB] hover:bg-blue-700 text-white'>
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-6'>
              {submitStatus === 'error' && (
                <div className='p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3'>
                  <AlertCircle className='w-5 h-5 text-red-600 mt-0.5 shrink-0' />
                  <p className='text-sm text-red-700 font-medium'>{errorMessage}</p>
                </div>
              )}

              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                <div>
                  <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-1'>Full Name *</label>
                  <input
                    type='text'
                    id='name'
                    name='name'
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all'
                    placeholder='John Doe'
                  />
                </div>
                <div>
                  <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>Email Address *</label>
                  <input
                    type='email'
                    id='email'
                    name='email'
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all'
                    placeholder='john@example.com'
                  />
                </div>
              </div>

              <div>
                <label htmlFor='subject' className='block text-sm font-medium text-gray-700 mb-1'>Subject *</label>
                <input
                  type='text'
                  id='subject'
                  name='subject'
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all'
                  placeholder='How can we help you?'
                />
              </div>

              <div>
                <label htmlFor='message' className='block text-sm font-medium text-gray-700 mb-1'>Message *</label>
                <textarea
                  id='message'
                  name='message'
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none'
                  placeholder='Write your message here...'
                />
              </div>

              <div className='flex justify-center my-4 w-full'>
                <div className='min-h-[65px]'>
                  {mounted && (
                    <Turnstile
                      sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                      onSuccess={(token) => setToken(token)}
                    />
                  )}
                </div>
              </div>

              <Button
                type='submit'
                disabled={isSubmitting}
                className='w-full h-12 bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-lg rounded-lg transition-all flex items-center justify-center gap-2'
              >
                {isSubmitting ? (
                  <>
                    <span className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message <Send className='w-5 h-5' />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
