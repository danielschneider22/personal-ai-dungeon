import Image from "next/image";
import { Message } from "./types";
import { Ref } from "react";

interface MessageProps {
  message: Message;
  showImages: boolean;
  isLoading: boolean;
  index: number;
  messages: Message[];
  ref: Ref<any>;
}

const MessageComponent: React.FC<MessageProps> = ({
  message,
  showImages,
  isLoading,
  index,
  messages,
  ref,
}) => {
  return (
    <div
      key={message.id}
      className={`flex ${
        message.sender === "user" ? "justify-start" : "justify-end"
      }`}
      ref={ref}
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
        {message.image === undefined &&
          message.text &&
          message.sender === "assistant" &&
          showImages && (
            <div
              className="mt-2 w-400 h-300 bg-gray-200 flex items-center justify-center relative rounded-lg"
              style={{ height: 400, width: 300 }}
            >
              <svg
                className="animate-spin h-12 w-12 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 50 50"
                width="50"
                height="50"
              >
                <circle
                  className="opacity-25"
                  cx="25"
                  cy="25"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="5"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M25 5A20 20 0 015 25h10A10 10 0 1125 5z"
                ></path>
              </svg>
            </div>
          )}
      </div>
    </div>
  );
};

export default MessageComponent;
