'use client';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function LoadingSpinner({ text = 'Cargando...', size = 'medium' }: LoadingSpinnerProps) {
  const sizeClass = size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-12 h-12' : 'w-8 h-8';

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClass} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`} />
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );
}
