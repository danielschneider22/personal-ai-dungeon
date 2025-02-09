import Image from "next/image";
import { Character } from "./types";
import { addPink } from "./Message";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash } from "lucide-react";
import { useAdmin } from "../utils/adminContext";

interface CharacterCardProps {
  character: Character;
  changeCharacter: (key: (string | number)[], value: any) => void;
  addToCharacter: (key: (string | number)[], value: any) => void;
  deleteFromCharacter: (key: (string | number)[]) => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  changeCharacter,
  addToCharacter,
  deleteFromCharacter,
}) => {
  const { isAdmin } = useAdmin();

  return (
    <div
      key={character.id + character.name}
      className="mb-6 p-4 bg-gray-800 rounded-lg"
    >
      <div className="flex items-center mb-4 row flex-col gap-3">
        <h3 className="text-xl font-bold">{character.name}</h3>
        {character.image && (
          <Image
            src={character.image}
            alt={character.name}
            width={400}
            height={300}
            className="mr-4"
          />
        )}
        {!character.image &&
          ((isAdmin && !character.mainCharacter) ||
            (!isAdmin && character.mainCharacter)) && (
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
      <Textarea
        className="mb-2 h-60 overflow-scroll"
        value={character.description}
        onChange={(e) => changeCharacter(["description"], e.target.value)}
      ></Textarea>
      {((isAdmin && !character.mainCharacter) ||
        (!isAdmin && character.mainCharacter)) && (
        <div className="mb-2">
          <h4 className="text-white font-semibold mb-1">
            {!isAdmin ? "% to level up" : "S Level"}
          </h4>
          <div className="bg-gray-700 h-6 rounded-full flex items-center">
            <div
              className={`${
                isAdmin ? "bg-[rgb(217,59,246)]" : "bg-[rgb(55,122,48)]"
              } h-6 rounded-full`}
              style={{ width: `${character.meter}%` }}
            >
              <div className="flex items-center justify-center h-full space-x-2 px-2">
                <span className="text-white">{character.meter}%</span>
                {isAdmin && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className="w-6 h-6 text-pink-700"
                    viewBox="0 0 24 24"
                    stroke="none"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
          <p className="mt-3">{addPink(character.meterDesc || "")}</p>
        </div>
      )}
      {character?.appearance?.length && !character.mainCharacter && (
        <div className="p-4 rounded-2xl mb-2">
          <h4 className="font-semibold mb-1">Appearance:</h4>
          <ul className="list-disc list-inside">
            {character.appearance.map((appearance, index) => (
              <li key={`${character.name}-"Appearance"-${index}`}>
                {addPink(appearance)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="p-4 rounded-2xl mb-2 flex flex-col items-center gap-2">
        <h4 className="font-semibold">Traits:</h4>
        <ul className="list-disc list-inside flex flex-col gap-4 w-full">
          {character.traits.map((trait, index) => (
            <li
              key={`${character.name}-trait-${index}`}
              className="list-none flex align-items justify-center items-center"
            >
              <Textarea
                onChange={(e) =>
                  changeCharacter(["traits", index], e.target.value)
                }
                className="flex-grow overflow-scroll h-28"
                value={trait}
              ></Textarea>
              <button
                className="flex items-center justify-center w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-300 ml-2"
                aria-label="Delete"
              >
                <Trash
                  className="w-5 h-5"
                  onClick={() => deleteFromCharacter(["traits", index])}
                />
              </button>
            </li>
          ))}
        </ul>
        <button
          className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-green-300"
          aria-label="Add"
        >
          <Plus
            className="w-5 h-5"
            onClick={() => addToCharacter(["traits"], "")}
          />
        </button>
      </div>
      <div className="p-4 rounded-2xl mb-2 flex flex-col items-center gap-2">
        <h4 className="font-semibold">Goals:</h4>
        <ul className="list-disc list-inside flex flex-col gap-4 w-full">
          {character.goals.map((goal, index) => (
            <li
              key={`${character.name}-goal-${index}`}
              className="list-none flex align-items justify-center items-center"
            >
              <Textarea
                onChange={(e) =>
                  changeCharacter(["goals", index], e.target.value)
                }
                className="flex-grow overflow-scroll h-28"
                value={goal}
              ></Textarea>
              <button
                className="flex items-center justify-center w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-300 ml-2"
                aria-label="Delete"
              >
                <Trash
                  className="w-5 h-5"
                  onClick={() => deleteFromCharacter(["goals", index])}
                />
              </button>
            </li>
          ))}
        </ul>
        <button
          className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-green-300"
          aria-label="Add"
        >
          <Plus
            className="w-5 h-5"
            onClick={() => addToCharacter(["goals"], "")}
          />
        </button>
      </div>
      {character.misc && (
        <div className=" p-4 rounded-2xl mb-2">
          <h4 className="font-semibold mb-1">Miscellaneous:</h4>
          <p className="whitespace-pre-wrap">{addPink(character.misc)}</p>
        </div>
      )}
    </div>
  );
};

export default CharacterCard;
