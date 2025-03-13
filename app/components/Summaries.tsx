import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

type Props = {
  summaryList: string[];
};

export function Summaries({ summaryList = [] }: Props) {
  const [activeSummary, setActiveSummary] = useState(summaryList.length - 1);

  useEffect(() => {
    setActiveSummary(summaryList.length - 1);
  }, [summaryList]);

  return (
    <>
      <select
        value={activeSummary}
        onChange={(e) => setActiveSummary(Number(e.target.value))}
        className="mb-4 bg-gray-700 text-gray-100 rounded-md p-2"
        style={{ marginLeft: 2, marginRight: 2 }}
      >
        {summaryList.map((summary, i) => (
          <option key={i} value={i}>
            {`Summary ${i + 1}`}
          </option>
        ))}
      </select>

      <Textarea
        placeholder="Story Summary"
        value={summaryList[activeSummary]}
        className="h-full overflow-scroll"
      />
      {/* <Button
        type="submit"
        className=" bg-green-600 text-white font-semibold rounded-md shadow-md 
         hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 
        focus:ring-offset-2 active:bg-green-800 transition duration-200 mt-2"
        onClick={() => console.log("SDFDSF")}
      >
        Rollback
      </Button> */}
    </>
  );
}
