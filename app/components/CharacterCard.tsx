import Image from "next/image";
import { Character } from "./types";
import { addPink } from "./Message";

interface CharacterCardProps {
  character: Character;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character }) => {
  return (
    <div key={character.id} className="mb-6 p-4 bg-gray-800 rounded-lg">
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
        {!character.image && !character.mainCharacter && (
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
      <p className="mb-2">{addPink(character.description)}</p>
      {!character.mainCharacter && (
        <div className="mb-2">
          <h4 className="text-white font-semibold mb-1">Slut level:</h4>
          <div className="bg-gray-700 h-6 rounded-full flex items-center">
            <div
              className="bg-[rgb(217,59,246)] h-6 rounded-full"
              style={{ width: `${character.meter}%` }}
            >
              <div className="flex items-center justify-center h-full space-x-2 px-2">
                <span className="text-white">{character.meter}%</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className="w-6 h-6 text-pink-700"
                  viewBox="0 0 24 24"
                  stroke="none"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
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
              <li key={`${appearance}-${index}`}>{addPink(appearance)}</li> // Combining trait with index for uniqueness
            ))}
          </ul>
        </div>
      )}
      {character?.traits?.length && (
        <div className="p-4 rounded-2xl mb-2">
          <h4 className="font-semibold mb-1">Traits:</h4>
          <ul className="list-disc list-inside">
            {character.traits.map((trait, index) => (
              <li key={`${trait}-${index}`}>{addPink(trait)}</li> // Combining trait with index for uniqueness
            ))}
          </ul>
        </div>
      )}
      {character?.goals?.length && (
        <div className="p-4 rounded-2xl mb-2">
          <h4 className="font-semibold mb-1">Goals:</h4>
          <ul className="list-disc list-inside">
            {character.goals.map((goal, index) => (
              <li key={`${goal}-${index}`}>{addPink(goal)}</li> // Combining goal with index for uniqueness
            ))}
          </ul>
        </div>
      )}
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
