import { useTheme } from './ThemeContext';
interface UserCardProps {
  user: {
    id: number;
    name: string;
    status: string;
    avatar: string;
  };
}
export const UserCard = ({
  user
}: UserCardProps) => {
  const {
    isDark
  } = useTheme();
  return <div className={`flex items-center p-4 hover:bg-gray-100 cursor-pointer transition-colors ${isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100'}`}>
      <div className="relative">
        <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        </div>
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${isDark ? 'border-gray-800' : 'border-white'} ${user.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`} />
      </div>
      <div className="ml-3">
        <h4 className={isDark ? 'text-gray-200' : 'text-gray-900'}>
          {user.name}
        </h4>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} capitalize`}>
          {user.status}
        </p>
      </div>
    </div>;
};