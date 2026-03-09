import SignupComponent from "@/components/auth/Signup";
import { Suspense } from "react";

const SignupPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupComponent />
    </Suspense>
  );
};

export default SignupPage;
