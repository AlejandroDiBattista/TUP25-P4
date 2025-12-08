'use client';

export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </header>
  );
}