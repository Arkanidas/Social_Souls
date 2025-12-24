import { SmileIcon, PaperclipIcon, SendIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import EmojiPicker, {Theme, EmojiStyle, } from 'emoji-picker-react';


type MessageInputProps = {
  onSend: (text: string) => void;
};



export const MessageInput = ({onSend}:MessageInputProps) => {

 const [MessageText, setMessageText] = useState<string>("");
 const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

 const emojiPickerRef = useRef<HTMLDivElement>(null);
 const emojiButtonRef = useRef<HTMLButtonElement>(null);

 useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;

    if (emojiPickerRef.current?.contains(target) || emojiButtonRef.current?.contains(target)) {
      return; 
    }

    setShowEmojiPicker(false); 
  };

    document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

 const handleSend = () => {
    if (!MessageText.trim()) return;
    onSend(MessageText);
    setMessageText("");
  };
  
  return <div className="p-4 border-t border-purple-900/30 bg-gray-900">
      <div className="flex items-center space-x-4">
        <button onClick={() => setShowEmojiPicker(prev => !prev)} ref={emojiButtonRef} className="text-gray-400 hover:text-purple-500">
          <SmileIcon className="h-6 w-6 cursor-pointer"/>
        </button>
        <button className="text-gray-400 hover:text-purple-500">
          <PaperclipIcon className="h-6 w-6 cursor-pointer" />
        </button>
        <div className="flex-1">
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-16 left-4 z-50">
           <EmojiPicker height={400} emojiStyle={EmojiStyle.GOOGLE} theme={Theme.DARK} onEmojiClick={(emojiData) => {setMessageText(prev => prev + emojiData.emoji);}}/>
       </div>)}
          <input value={MessageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
            type="text" placeholder="Send a message into the void..." className="w-full bg-gray-800 text-gray-300 border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600/80 border animation-ease-in duration-200" />
        </div>
        <button onClick={handleSend} className="text-purple-500 hover:text-purple-600">
          <SendIcon className="h-6 w-6  cursor-pointer"
    />
        </button>
      </div>
    </div>;
};