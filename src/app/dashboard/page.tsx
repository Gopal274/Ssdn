import Header from '@/components/Header';
import ProductTable from '@/components/ProductTable';
import { Suspense } from 'react';
import Loading from './loading';

export const metadata = {
  title: 'Dashboard – Goods Rate Register',
};

export default function Dashboard() {
  return (
    <div className="min-h-screen w-full">
      <Header />
      <main className="p-4 md:p-6 lg:p-8">
        <Suspense fallback={<Loading />}>
          <ProductTable />
        </Suspense>
      </main>
    </div>
  );
}
