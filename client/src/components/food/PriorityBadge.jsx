import Badge from "../ui/Badge.jsx";
import { PRIORITY_COLORS } from "../../utils/constants.js";

export default function PriorityBadge({ level }) {
  const c = PRIORITY_COLORS[level] || PRIORITY_COLORS.LOW;
  return (
    <Badge bg={c.bg} text={c.text} className="font-mono tracking-wide">
      {level}
    </Badge>
  );
}
