import Image from "next/image";
import { Character } from "./types";

interface CharacterCardProps {
  character: Character;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character }) => {
  return (
    <div key={character.id} className="mb-6 p-4 bg-gray-800 rounded-lg">
      <div className="flex items-center mb-4">
        <Image
          src={character.image}
          alt={character.name}
          width={50}
          height={50}
          className="rounded-full mr-4"
        />
        <h3 className="text-xl font-bold">{character.name}</h3>
      </div>
      <p className="mb-2">{character.description}</p>
      <div className="mb-2">
        <div className="bg-gray-700 h-2 rounded-full">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${character.meter}%` }}
          ></div>
        </div>
        <span className="text-sm">{character.meter}/100</span>
      </div>
      <div>
        <h4 className="font-semibold mb-1">Traits:</h4>
        <ul className="list-disc list-inside">
          {character.traits.map((trait, index) => (
            <li key={index}>{trait}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CharacterCard;
