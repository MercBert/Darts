import Darts from "@/components/Darts";
import { dartsGame } from "@/lib/games";

export default function Home() {
  return <Darts game={dartsGame} />;
}
