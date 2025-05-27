import { SmileIcon, PaperclipIcon, SendIcon } from 'lucide-react';
import { useTheme } from './ThemeContext';
export const MessageInput = () => {
  const {
    isDark
  } = useTheme();
  return <div className={`p-4 border-t ${isDark ? 'border-purple-900/30 bg-gray-900' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center space-x-4">
        <button className={`${isDark ? 'text-gray-400' : 'text-gray-600'} hover:text-purple-500`}>
          <SmileIcon className="h-6 w-6" />
        </button>
        <button className={`${isDark ? 'text-gray-400' : 'text-gray-600'} hover:text-purple-500`}>
          <PaperclipIcon className="h-6 w-6" />
        </button>
        <div className="flex-1">
          <input type="text" placeholder="Send a message into the void..." className={`w-full ${isDark ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-200'} px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 border`} />
        </div>
        <button className="text-purple-500 hover:text-purple-600">
          <SendIcon className="h-6 w-6" />
        </button>
      </div>
    </div>;
};