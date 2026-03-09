import OTPVerifyComponent from "@/components/auth/OTPVerify";
import { Suspense } from "react";

const OTPVerifyPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OTPVerifyComponent />
    </Suspense>
  );
};

export default OTPVerifyPage;
