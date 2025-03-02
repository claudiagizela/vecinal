import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Menu, Users, Package, UserCircle2, LogOut } from 'lucide-react';
import { useAuth } from '@/context/auth';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  const navItems = [
    {
      title: 'Vecinos',
      icon: Users,
      path: '/neighbors',
      active: location.pathname === '/neighbors',
    },
    {
      title: 'Paquetes',
      icon: Package,
      path: '/packages',
      active: location.pathname === '/packages',
    },
    {
      title: 'Usuarios',
      icon: UserCircle2,
      path: '/users',
      active: location.pathname === '/users',
    },
  ];

  return (
    <div 
      className={cn(
        "h-screen bg-background border-r flex flex-col transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <h2 className="font-semibold text-lg">Condominio</h2>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          <Menu size={20} />
        </Button>
      </div>
      
      <Separator />
      
      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path}
                className={cn(
                  "flex items-center p-2 text-sm rounded-md transition-colors hover:bg-accent group",
                  item.active && "bg-accent",
                  collapsed ? "justify-center" : "justify-start"
                )}
              >
                <div className={cn(
                  "rounded-md p-1",
                  item.active ? "text-primary" : "text-muted-foreground"
                )}>
                  <item.icon size={20} />
                </div>
                {!collapsed && (
                  <span 
                    className={cn(
                      "ml-3 transition-opacity", 
                      item.active ? "font-medium" : ""
                    )}
                  >
                    {item.title}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Footer with logout */}
      <div className="p-2 mt-auto">
        <Separator className="mb-2" />
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className={cn(
            "w-full flex items-center p-2 text-sm rounded-md transition-colors hover:bg-accent",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <div className="text-muted-foreground">
            <LogOut size={20} />
          </div>
          {!collapsed && (
            <span className="ml-3">Cerrar Sesión</span>
          )}
        </Button>
        
        {!collapsed && (
          <div className="text-xs text-muted-foreground mt-4 px-2">
            v1.0.0
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
