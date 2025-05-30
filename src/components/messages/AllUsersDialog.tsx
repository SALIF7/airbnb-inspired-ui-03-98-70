
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, X, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { ADMIN_USER, Conversation } from './types';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export interface AllUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser: (user: User) => void;
  currentUserId?: string;
  conversations: Conversation[];
}

export const AllUsersDialog: React.FC<AllUsersDialogProps> = ({ 
  open, 
  onOpenChange, 
  onSelectUser,
  currentUserId,
  conversations
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  const loadUsers = () => {
    setLoading(true);
    try {
      // Pour les besoins de la démo, inclure l'administrateur comme contact principal
      const adminUser = {
        id: ADMIN_USER.id,
        name: ADMIN_USER.name,
        avatar: ADMIN_USER.avatar,
        role: ADMIN_USER.role
      };
      
      // Ajouter également quelques utilisateurs simulés pour une meilleure expérience de démo
      const mockUsers = [
        {
          id: 'user1',
          name: 'Marie Dupont',
          avatar: '/placeholder.svg',
          role: 'user'
        },
        {
          id: 'user2',
          name: 'Thomas Martin',
          avatar: '/placeholder.svg',
          role: 'user'
        },
        {
          id: 'user3',
          name: 'Sophie Bernard',
          avatar: '/placeholder.svg',
          role: 'user'
        }
      ];
      
      setUsers([adminUser, ...mockUsers]);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      toast.error("Impossible de charger la liste des utilisateurs");
      
      // Ajouter l'admin en secours en cas d'erreur
      setUsers([ADMIN_USER]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectUser = (user: User) => {
    onSelectUser(user);
    onOpenChange(false);
    toast.success(`Conversation avec ${user.name} ouverte`);
  };

  // Vérifier si une conversation existe déjà avec cet utilisateur
  const conversationExists = (userId: string) => {
    return conversations.some(conv => conv.with.id === userId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sélectionner un contact</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-2">
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p>Chargement...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Aucun contact trouvé</p>
                </div>
              ) : (
                filteredUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer card-reveal"
                    onClick={() => handleSelectUser(user)}
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={user.avatar || '/placeholder.svg'} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      {user.email && (
                        <p className="text-sm text-gray-500">{user.email}</p>
                      )}
                    </div>
                    <Button size="sm" variant="ghost" className="ml-2 hover-lift">
                      {conversationExists(user.id) ? (
                        <span className="text-xs text-gray-500">Existant</span>
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
