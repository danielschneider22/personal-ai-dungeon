import { useRef, useEffect, useState } from "react";
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
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const [prevMessageCount, setPrevMessageCount] = useState(messages.length);
  const prevIsLoading = useRef(isLoading);
  const prevShowImages = useRef(showImages);

  useEffect(() => {
    if (
      (messages.length !== prevMessageCount ||
        prevShowImages.current !== showImages ||
        (isLoading === false && prevIsLoading.current === true)) &&
      scrollAreaRef.current &&
      lastMessageRef.current
    ) {
      // Scroll the scroll area such that the top of the last message aligns with the top of the scroll area
      scrollAreaRef.current.children[1].scrollTop =
        lastMessageRef.current.offsetTop;
    }
    setPrevMessageCount(messages.length);
  }, [messages, isLoading, showImages]);

  useEffect(() => {
    prevIsLoading.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    prevShowImages.current = showImages;
  }, [showImages]);

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
            ref={index === messages.length - 1 ? lastMessageRef : null} // Attach ref to the last message
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default MessageList;
