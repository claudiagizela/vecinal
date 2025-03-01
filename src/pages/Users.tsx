
import React from 'react';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle2 } from 'lucide-react';

const Users = () => {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b py-4 px-6 mb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <UserCircle2 size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-medium">Administración de Usuarios</h1>
                  <p className="text-sm text-muted-foreground">
                    Gestiona los usuarios del sistema
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 pb-16 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios del sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Esta sección está en desarrollo. Pronto podrás gestionar los usuarios del sistema desde aquí.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Users;
