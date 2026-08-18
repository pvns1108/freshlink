import Badge from "../ui/Badge.jsx";
import { STATUS_COLORS } from "../../utils/constants.js";

export default function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.Fresh;
  return (
    <Badge bg={c.bg} text={c.text} dot={c.dot}>
      {status}
    </Badge>
  );
}
