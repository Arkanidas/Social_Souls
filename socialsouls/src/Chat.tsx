import {Sidebar} from './chat components/Sidebar';
import {useTheme} from './chat components/ThemeContext'
import {ChatArea} from './chat components/ChatArea';




 const Chat = () => {



    const {
      isDark
    } = useTheme();
    return <div className={`flex h-screen ${isDark ? 'bg-gray-900/95' : 'bg-gray-50/95'}`}>
        <Sidebar />
        <ChatArea />
      </div>;
  };

  export default Chat