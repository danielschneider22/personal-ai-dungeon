import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageComponent from "./Message";
import { Message } from "./types";

interface MessageListProps {
  messages: Message[];
  showImages: boolean;
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  showImages,
  isLoading,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
      <div className="max-w-2xl mx-auto space-y-4">
        {messages.map((message, index) => (
          <MessageComponent
            key={message.id}
            message={message}
            showImages={showImages}
            isLoading={isLoading}
            index={index}
            messages={messages}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default MessageList;
