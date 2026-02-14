'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface KBDocumentUploaderProps {
  onUpload: (files: FileUploadData[]) => void;
  isUploading?: boolean;
  acceptedTypes?: string[];
}

export interface FileUploadData {
  filename: string;
  fileType: string;
  fileSize: number;
  content: string;
}

const DEFAULT_ACCEPTED_TYPES = ['.pdf', '.md', '.txt', '.html', '.docx', '.csv'];

export function KBDocumentUploader({
  onUpload,
  isUploading,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
}: KBDocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback(async (files: FileList) => {
    setError(null);
    const uploadData: FileUploadData[] = [];

    for (const file of Array.from(files)) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!acceptedTypes.includes(ext)) {
        setError(`Unsupported file type: ${ext}. Supported: ${acceptedTypes.join(', ')}`);
        continue;
      }

      try {
        // Read file content for text-based files
        const content = await readFileContent(file);
        const fileType = ext.replace('.', '');
        
        uploadData.push({
          filename: file.name,
          fileType,
          fileSize: file.size,
          content,
        });
      } catch (err) {
        console.error(`Error reading file ${file.name}:`, err);
        setError(`Failed to read file: ${file.name}`);
      }
    }

    if (uploadData.length > 0) {
      onUpload(uploadData);
    }
  }, [acceptedTypes, onUpload]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
      // Reset input
      e.target.value = '';
    }
  }, [processFiles]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-lg font-medium mb-2">
            {isUploading ? 'Uploading...' : 'Drop files here'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            or click to browse
          </p>
          <Button
            variant="outline"
            onClick={handleClick}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Select Files'}
          </Button>
          <p className="text-xs text-gray-400 mt-4">
            Supported formats: {acceptedTypes.join(', ')}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}

// Helper to read file content
async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        resolve(content);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    
    reader.onerror = () => reject(reader.error);
    
    // For binary files like PDF/DOCX, we'd need different handling
    // For MVP, we support text-based files directly
    reader.readAsText(file);
  });
}
