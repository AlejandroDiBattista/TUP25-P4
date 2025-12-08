"use client";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <LoginForm />
      </div>
    </div>
  );
}
