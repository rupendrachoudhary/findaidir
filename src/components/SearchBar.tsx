'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  size?: 'default' | 'lg';
  defaultValue?: string;
}

export default function SearchBar({
  placeholder = 'Search AI tools...',
  className = '',
  size = 'default',
  defaultValue = ''
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/tools?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/tools');
    }
  };

  const inputHeight = size === 'lg' ? 'h-14 text-lg' : 'h-10';
  const iconSize = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
  const paddingLeft = size === 'lg' ? 'pl-14' : 'pl-10';

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconSize} text-muted-foreground`} />
      <Input
        type="search"
        placeholder={placeholder}
        className={`${paddingLeft} pr-24 ${inputHeight} rounded-full border-2 focus:border-primary`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button
        type="submit"
        size={size === 'lg' ? 'default' : 'sm'}
        className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full ${size === 'lg' ? 'px-6' : ''}`}
      >
        Search
      </Button>
    </form>
  );
}
