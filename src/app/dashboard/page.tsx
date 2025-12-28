
import Header from '@/components/Header';
import ProductTable from '@/components/ProductTable';
import { Suspense } from 'react';
import Loading from './loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export const metadata = {
  title: 'Dashboard – Goods Rate Register',
};

export default function Dashboard() {
  return (
    <div className="min-h-screen w-full">
      <Header />
      <main className="p-4 md:p-6 lg:p-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:w-[400px] mb-4 no-print">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
             <Suspense fallback={<Loading />}>
                <AnalyticsDashboard />
            </Suspense>
          </TabsContent>
          <TabsContent value="register">
            <Suspense fallback={<Loading />}>
              <ProductTable />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
