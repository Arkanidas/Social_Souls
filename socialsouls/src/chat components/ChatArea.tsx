import { MessageInput } from './MessageInput';
import { useTheme } from './ThemeContext';
export const ChatArea = () => {
  const {
    isDark
  } = useTheme();
  const messages = [{
    id: 1,
    sender: 'Shadow Walker',
    content: 'The spirits are restless tonight...',
    time: '11:30 PM',
    type: 'received'
  }, {
    id: 2,
    sender: 'You',
    content: 'Indeed, I can feel their presence',
    time: '11:32 PM',
    type: 'sent'
  }, {
    id: 3,
    sender: 'Shadow Walker',
    content: 'Shall we conduct a séance?',
    time: '11:33 PM',
    type: 'received'
  }, {
    id: 4,
    sender: 'You',
    content: "I'll prepare the ritual circle",
    time: '11:35 PM',
    type: 'sent'
  }];
  
  return <div className="flex-1 flex flex-col relative z-10">
      <div className={`p-4 border-b backdrop-blur-sm ${isDark ? 'border-purple-900/30 bg-gray-900/95' : 'border-gray-200 bg-white/95'} flex items-center`}>
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${isDark ? 'border-purple-500' : 'border-purple-400'}`}>
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop" alt="Shadow Walker" className="w-full h-full object-cover" />
          </div>
          <div className="ml-3">
            <h3 className={isDark ? 'text-white' : 'text-gray-900'}>
              Shadow Walker
            </h3>
            <p className="text-sm text-purple-500">Haunting Online</p>
          </div>
        </div>
      </div>
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50/50'}`}>
        {messages.map(message => <div key={message.id} className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-4 rounded-lg ${message.type === 'sent' ? 'bg-purple-600 text-white ml-12' : `${isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900 shadow-sm'} mr-12`}`}>
              <p className="text-sm font-medium mb-1">{message.sender}</p>
              <p className="mb-2">{message.content}</p>
              <p className="text-xs opacity-70">{message.time}</p>
            </div>
          </div>)}
      </div>
      <MessageInput />
    </div>;
};