import Image from "next/image";
import { Message } from "./types";

interface MessageProps {
  message: Message;
  showImages: boolean;
  isLoading: boolean;
  index: number;
  messages: Message[];
}

const MessageComponent: React.FC<MessageProps> = ({
  message,
  showImages,
  isLoading,
  index,
  messages,
}) => {
  const opacity = Math.max(0.3, 1 - index / messages.length);

  return (
    <div
      key={message.id}
      className={`flex ${
        message.sender === "user" ? "justify-start" : "justify-end"
      }`}
      style={{ opacity }}
    >
      <div
        className={`max-w-[90%] p-3 rounded-lg ${
          message.sender === "user" ? "bg-blue-600" : "bg-gray-800"
        }`}
      >
        {message.sender === "assistant" &&
        isLoading &&
        index === messages.length - 1 ? (
          <div className="loading-bubble">
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : (
          <p className="typewriter" style={{ whiteSpace: "pre-line" }}>
            {message.text}
          </p>
        )}
        {message.image && showImages && (
          <div className="mt-2">
            <Image
              src={`data:image/png;base64,${message.image}`}
              alt={message.caption || "AI-generated image"}
              width={400}
              height={300}
              className="rounded-lg"
            />
            {message.caption && (
              <p className="mt-1 text-sm text-gray-300 italic">
                {message.caption}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageComponent;
