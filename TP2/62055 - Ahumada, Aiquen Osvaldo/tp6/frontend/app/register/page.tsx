"use client";
import RegisterForm from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <RegisterForm />
      </div>
    </div>
  );
}
