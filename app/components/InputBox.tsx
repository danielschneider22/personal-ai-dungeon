import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, PaintbrushIcon as PaintBrush, Undo, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Message } from "./types";

interface InputBoxProps {
  isInputVisible: boolean;
  toggleInput: () => void;
  handleSubmit: (input: string) => void;
  handleContinue: () => void;
  handleRetry: () => void;
  handleUndo: () => void;
  handleRedrawImage: () => void;
  messages: Message[];
}

const InputBox: React.FC<InputBoxProps> = ({
  isInputVisible,
  toggleInput,
  handleSubmit,
  handleContinue,
  handleRetry,
  handleUndo,
  handleRedrawImage,
  messages,
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  useEffect(() => {
    if (isInputVisible) {
      textAreaRef.current!.focus();
    }
  }, [isInputVisible]);

  return (
    <div className="bg-gray-800 relative">
      <div className="max-w-2xl mx-auto">
        <div className="flex p-2 gap-3">
          <div
            className={`flex-grow transition-all duration-300 ease-in-out bg-gray-900 ${
              isInputVisible
                ? "opacity-100 max-w-full"
                : "opacity-0 max-w-0 overflow-hidden"
            }`}
          >
            <Textarea
              placeholder="What will you do next?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-gray-700 text-gray-100 overflow-y-auto"
              style={!isInputVisible ? { display: "none" } : {}}
              ref={textAreaRef}
            />
          </div>
          <div
            className={`flex bg-gray-900 transition-all duration-300 ease-in-out ${
              isInputVisible ? "flex-shrink-0" : "flex-grow w-full"
            }`}
          >
            <Button
              type="submit"
              className={`transition-all duration-300 ease-in-out h-full ${
                isInputVisible ? "flex-shrink-0" : "flex-grow"
              }`}
              onClick={() => {
                if (isInputVisible) {
                  setInput("");
                  handleSubmit(input);
                }
                toggleInput();
              }}
            >
              {!isInputVisible ? "Take a turn" : "Go!"}
            </Button>
            <Button
              onClick={handleContinue}
              variant="outline"
              className={`bg-gray-700 text-gray-100 hover:bg-gray-600 transition-all duration-300 ease-in-out ${
                isInputVisible
                  ? "w-0 p-0 m-0 border-transparent overflow-hidden opacity-0"
                  : "flex-grow opacity-100"
              }`}
            >
              Continue
            </Button>
            <Button
              onClick={handleRetry}
              variant="ghost"
              size="icon"
              className={`transition-all duration-300 ease-in-out ${
                isInputVisible
                  ? "w-0 p-0 m-0 border-transparent overflow-hidden opacity-0"
                  : "flex-grow"
              }`}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleUndo}
              variant="ghost"
              size="icon"
              className={`transition-all duration-300 ease-in-out ${
                isInputVisible
                  ? "w-0 p-0 m-0 border-transparent overflow-hidden opacity-0"
                  : "flex-grow"
              }`}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleRedrawImage}
              variant="ghost"
              size="icon"
              className={`transition-all duration-300 ease-in-out ${
                isInputVisible
                  ? "w-0 p-0 m-0 border-transparent overflow-hidden opacity-100"
                  : "flex-grow"
              }`}
              disabled={!messages.length}
            >
              <PaintBrush className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {isInputVisible && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleInput}
          className="absolute left-1/2 transform -translate-x-1/2 -top-10 right-2 rounded-full p-1 hover:bg-gray-700"
        >
          <X className="h-8 w-8" />
        </Button>
      )}
    </div>
  );
};

export default InputBox;
