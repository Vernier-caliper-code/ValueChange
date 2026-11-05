import { ProductEditor } from '@/components/forms/product-editor';

export default function NewProductPage() {
  return (
    <div>
      <h2 className="mb-6 text-[20px] font-bold">添加商品</h2>
      <ProductEditor />
    </div>
  );
}
