'use client';

import { useRef, useState } from 'react';

import { uploadImageAction } from '@/lib/actions/upload';
import { buttonStyles } from '@/components/ui/button';

export function ImageUpload({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // 客户端预校验
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('仅支持 JPG/PNG/WebP 图片');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('图片不能超过 5MB');
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadImageAction(formData);
      if (!result.ok) {
        throw new Error(result.error ?? '上传失败，请重试');
      }
      onChange(result.url!);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败，请重试');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        className={buttonStyles({ variant: 'secondary', size: 'sm' })}
      >
        {uploading ? '上传中…' : value ? '更换图片' : '上传图片'}
      </button>
      {value ? (
        <span className="max-w-[200px] truncate text-[12px] text-muted" title={value}>
          {value}
        </span>
      ) : null}
      {error ? (
        <p role="alert" className="text-[12px] text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}