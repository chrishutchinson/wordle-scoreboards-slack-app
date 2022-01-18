import { useSession, signIn, signOut } from "next-auth/client";
import Image from "next/image";
import { AddToSlackButton } from "../components/AddToSlackButton/AddToSlackButton";

const AuthContainer = () => {
  const [session] = useSession();

  if (session) {
    return (
      <div>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }

  return (
    <div>
      <AddToSlackButton />
    </div>
  );
};

const Home = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        maxWidth: 1000,
        margin: "0 auto",
        padding: "30px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            marginRight: "10px",
          }}
        >
          <Image
            src="/logo.png"
            width="100"
            height="100"
            alt="Wordle Scoreboards Logo"
          />
        </div>

        <div>
          <h1>
            Wordle Scoreboards <small>for Slack</small>
          </h1>
          <p>
            Compete with your teammates at the most viral word game since the
            last viral word game!
          </p>
        </div>
      </div>
      <hr />
      <div
        style={{
          marginBottom: "30px",
        }}
      >
        <AuthContainer />
      </div>
      <div>
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/nqjn7EwD90U"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default Home;
