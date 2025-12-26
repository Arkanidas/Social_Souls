import { SmileIcon, PaperclipIcon, SendIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import EmojiPicker, {Theme, EmojiStyle, } from 'emoji-picker-react';
import type { height } from '@fortawesome/free-solid-svg-icons/fa0';


type MessageInputProps = {
  onSend: (text: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  attachments: File[];
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>;
  isDragging: boolean;
};



export const MessageInput = ({onSend, setAttachments, fileInputRef, attachments, isDragging}:MessageInputProps) => {

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
    setAttachments([]);
  };
  
  return <div className="p-4 border-t border-purple-900/30 bg-gray-900">
      <div className="flex items-center space-x-4">
        <button onClick={() => setShowEmojiPicker(prev => !prev)} ref={emojiButtonRef} className="text-gray-400 hover:text-purple-500">
          <SmileIcon className="h-6 w-6 cursor-pointer"/>
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-purple-500">
          <PaperclipIcon className="h-6 w-6 cursor-pointer" />
     {isDragging && (
  <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center pointer-events-none">
    <div className="border-4 border-dashed border-purple-500 rounded-xl p-12">
      <PaperclipIcon className="h-16 w-16 text-purple-400" />
    </div>
  </div>
)}
        </button>
        <div className="flex-1">
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-16 left-4 z-50">
           <EmojiPicker height={400} emojiStyle={EmojiStyle.GOOGLE} theme={Theme.DARK} onEmojiClick={(emojiData) => {setMessageText(prev => prev + emojiData.emoji);}}/>
       </div>)}
          <div className={`flex flex-col ${attachments.length > 0 ? "pt-2": ""}`}> 
            <input value={MessageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
            type="text" placeholder="Send a message into the void..." className= {`flex flex-col w-full bg-gray-800 text-gray-300 border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600/80 border animation-ease-in duration-200${attachments.length > 0 ? "pt-2": ""}`}/>
         </div>
        </div>
        <button onClick={handleSend} className="text-purple-500 hover:text-purple-600">
          <SendIcon className="h-6 w-6 cursor-pointer"/>
        </button>
      </div>

      {attachments.length > 0 && (
  <div className="flex gap-2 mb-2 flex-wrap">
    {attachments.map((file, index) => (
      <div
        key={index}
        className="relative w-20 h-20 border rounded overflow-hidden bg-gray-800"
      >
        {file.type.startsWith("image") ? (
          <img
            src={URL.createObjectURL(file)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-white text-center px-1">
            {file.name}
          </div>
        )}

        <button
          onClick={() =>
            setAttachments((prev) =>
              prev.filter((_, i) => i !== index)
            )
          }
          className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer"
        >
          ✕
        </button>
      </div>
    ))}
  </div>
)}
    </div>;

    
};