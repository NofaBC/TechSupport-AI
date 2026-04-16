'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { KnowledgeBase } from '@/types';

// NOFA SaaS Products - add more as needed
const PRODUCTS = [
  { value: 'dlyn-ai', label: 'Dlyn AI' },
  { value: 'smartrank-ai', label: 'SmartRank AI' },
  { value: 'recalliq', label: 'RecallIQ™' },
  { value: 'visionwing', label: 'VisionWing™' },
  { value: 'affiliateledger-ai', label: 'AffiliateLedger AI™' },
  { value: 'commanddesk-ai', label: 'CommandDesk AI' },
  { value: 'techsupport-ai', label: 'TechSupport AI™' },
  { value: 'ai-factory', label: 'AI Factory' },
  { value: 'other', label: 'Other (Custom)' },
];

interface CreateKnowledgeBaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (kb: KnowledgeBase) => void;
  userId?: string;
}

export function CreateKnowledgeBaseDialog({
  open,
  onOpenChange,
  onCreated,
  userId,
}: CreateKnowledgeBaseDialogProps) {
  const [name, setName] = useState('');
  const [product, setProduct] = useState('');
  const [customProduct, setCustomProduct] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError('You must be logged in to create a knowledge base');
      return;
    }

    const finalProduct = product === 'other' ? customProduct.trim() : product;
    if (!name.trim() || !finalProduct) {
      setError('Name and product are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/knowledge-base', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': userId,
        },
        body: JSON.stringify({
          name: name.trim(),
          product: product === 'other' ? customProduct.trim() : PRODUCTS.find(p => p.value === product)?.label || product,
          description: description.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create knowledge base');
      }

      const newKb = await response.json();
      
      // Reset form
      setName('');
      setProduct('');
      setCustomProduct('');
      setDescription('');
      
      onCreated(newKb);
    } catch (err) {
      console.error('Error creating knowledge base:', err);
      setError(err instanceof Error ? err.message : 'Failed to create knowledge base');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      if (!newOpen) {
        // Reset form when closing
        setName('');
        setProduct('');
        setCustomProduct('');
        setDescription('');
        setError(null);
      }
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Knowledge Base</DialogTitle>
            <DialogDescription>
              Create a new knowledge base to train your AI support agent with product documentation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                placeholder="e.g., Dlyn AI Documentation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="product" className="text-sm font-medium">
                Product <span className="text-destructive">*</span>
              </label>
              <Select value={product} onValueChange={setProduct} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCTS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {product === 'other' && (
              <div className="space-y-2">
                <label htmlFor="customProduct" className="text-sm font-medium">
                  Custom Product Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="customProduct"
                  placeholder="Enter your product name"
                  value={customProduct}
                  onChange={(e) => setCustomProduct(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input
                id="description"
                placeholder="Brief description of this knowledge base"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
