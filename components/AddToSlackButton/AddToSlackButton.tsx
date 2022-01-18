import { signIn } from "next-auth/client";
import Image from "next/image";

export const AddToSlackButton = () => {
  return (
    <button
      onClick={() => signIn("slack")}
      style={{
        padding: 0,
        background: "transparent",
        margin: 0,
        border: 0,
      }}
    >
      <Image
        alt="Add to Slack"
        height="40"
        width="139"
        src="https://platform.slack-edge.com/img/add_to_slack@2x.png"
      />
    </button>
  );
};
